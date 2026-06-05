import {
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
  type RxJsonSchema,
} from "rxdb";
import { getRxStorageLocalstorage } from "rxdb/plugins/storage-localstorage";
import { euclideanDistance } from "rxdb/plugins/vector";
import { sha256 } from "js-sha256";

export type NoteDocType = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type VectorDocType = {
  id: string;
  embedding: number[];
};

type NotesCollection = RxCollection<NoteDocType>;
type VectorsCollection = RxCollection<VectorDocType>;

type NotesDatabaseCollections = {
  notes: NotesCollection;
  vectors: VectorsCollection;
};

type NotesDatabase = RxDatabase<NotesDatabaseCollections>;

const noteSchema: RxJsonSchema<NoteDocType> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    title: {
      type: "string",
      maxLength: 300,
    },
    content: {
      type: "string",
      maxLength: 10000,
    },
    createdAt: {
      type: "number",
      minimum: 0,
      maximum: 9999999999999,
      multipleOf: 0.01,
    },
  },
  required: ["id", "title", "content", "createdAt"],
};

const vectorSchema: RxJsonSchema<VectorDocType> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    embedding: {
      type: "array",
      minItems: 384,
      maxItems: 384,
      items: {
        type: "number",
        multipleOf: 0.0000001,
      },
    },
  },
  required: ["id", "embedding"],
};

let dbPromise: Promise<NotesDatabase> | null = null;

async function rxHashFunction(
  input: string | ArrayBuffer | Blob,
): Promise<string> {
  if (typeof Blob !== "undefined" && input instanceof Blob) {
    return sha256(await input.arrayBuffer());
  }

  return sha256(input as string | ArrayBuffer);
}

export function getDatabase(): Promise<NotesDatabase> {
  dbPromise ??= (async () => {
    const db = await createRxDatabase<NotesDatabaseCollections>({
      name: "notes-vector-db",
      storage: getRxStorageLocalstorage(),
      hashFunction: rxHashFunction,
    });

    await db.addCollections({
      notes: { schema: noteSchema },
      vectors: { schema: vectorSchema },
    });

    return db;
  })();

  return dbPromise;
}

export async function getAllNotes(): Promise<NoteDocType[]> {
  const db = await getDatabase();
  const docs = await db.notes.find().exec();

  return docs
    .map((doc) => doc.toJSON())
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveNoteWithEmbedding(
  note: NoteDocType,
  embedding: number[],
): Promise<void> {
  const db = await getDatabase();

  await db.notes.upsert(note);
  await db.vectors.upsert({
    id: note.id,
    embedding,
  });
}

export async function deleteNoteById(noteId: string): Promise<void> {
  const db = await getDatabase();

  const noteDoc = await db.notes.findOne(noteId).exec();
  if (noteDoc) {
    await noteDoc.remove();
  }

  const vectorDoc = await db.vectors.findOne(noteId).exec();
  if (vectorDoc) {
    await vectorDoc.remove();
  }
}

export type SearchResult = {
  note: NoteDocType;
  score: number;
};

function isSearchResult(value: SearchResult | null): value is SearchResult {
  return value !== null;
}

export async function searchNotesByEmbedding(
  queryEmbedding: number[],
  limit = 5,
): Promise<SearchResult[]> {
  const db = await getDatabase();
  const vectorDocs = await db.vectors.find().exec();

  const ranked = vectorDocs
    .map((doc) => {
      const vector = doc.toJSON();
      const distance = euclideanDistance(queryEmbedding, [...vector.embedding]);

      return {
        id: vector.id,
        distance,
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  if (ranked.length === 0) {
    return [];
  }

  const ids = ranked.map((entry) => entry.id);
  const noteMap = await db.notes.findByIds(ids).exec();

  return ranked
    .map((entry) => {
      const noteDoc = noteMap.get(entry.id);
      if (!noteDoc) {
        return null;
      }

      return {
        note: noteDoc.toJSON(),
        score: 1 / (1 + entry.distance),
      };
    })
    .filter(isSearchResult);
}
