import type { Browser, Document } from "@hyperjump/browser";
import type { Validator, OutputUnit, OutputFormat, SchemaObject } from "./index.js";
import type { Instance } from "./instance.js";


// Compile/interpret
export const compile: (url: string) => Promise<CompiledSchema>;
export const interpret: (
  (compiledSchema: CompiledSchema, value: unknown, outputFormat?: OutputFormat) => OutputUnit
) & (
  (compiledSchema: CompiledSchema) => Validator
);

export type CompiledSchema = {
  schemaUri: string;
  ast: AST;
};

type AST = {
  metaData: Record<string, MetaData>;
} & Record<string, Node<Node<unknown>[] | boolean>>;

type Node<A> = [keywordId: string, schemaUri: string, keywordValue: A];

type MetaData = {
  id: string;
  dynamicAnchors: Anchors;
  anchors: Anchors;
};

type Anchors = Record<string, string>;

// Output Formats
export const BASIC: "BASIC";
export const DETAILED: "DETAILED";
export const VERBOSE: "VERBOSE";

// Schema
export const getSchema: (uri: string, browser?: Browser) => Promise<Browser<SchemaDocument>>;
export const buildSchemaDocument: (schema: SchemaObject | boolean, retrievalUri?: string, contextDialectId?: string) => SchemaDocument;
export const canonicalUri: (browser: Browser<SchemaDocument>) => string;
export const toSchema: (browser: Browser<SchemaDocument>, options?: ToSchemaOptions) => SchemaObject;

export type ToSchemaOptions = {
  contextDialectId?: string;
  includeDialect?: "auto" | "always" | "never";
  selfIdentify?: boolean;
  contextUri?: string;
  includeEmbedded?: boolean;
};

export type SchemaDocument = Document & {
  dialectId: string;
  anchors: Record<string, string>;
  dynamicAnchors: Record<string, string>;
};

// Vocabulary System
export const addKeyword: <A>(keywordHandler: Keyword<A>) => void;
export const getKeywordName: (dialectId: string, keywordId: string) => string;
export const getKeyword: <A>(id: string) => Keyword<A>;
export const getKeywordByName: <A>(keywordName: string, dialectId: string) => Keyword<A>;
export const getKeywordId: (keywordName: string, dialectId: string) => string;
export const defineVocabulary: (id: string, keywords: { [keyword: string]: string }) => void;
export const loadDialect: (dialectId: string, dialect: { [vocabularyId: string]: boolean }, allowUnknownKeywords?: boolean) => void;
export const unloadDialect: (dialectId: string) => void;
export const hasDialect: (dialectId: string) => boolean;

export type Keyword<A> = {
  id: string;
  compile: (schema: Browser<SchemaDocument>, ast: AST, parentSchema: Browser<SchemaDocument>) => Promise<A>;
  interpret: (compiledKeywordValue: A, instance: Instance, ast: AST, dynamicAnchors: Anchors) => boolean;
  collectEvaluatedProperties?: (compiledKeywordValue: A, instance: Instance, ast: AST, dynamicAnchors: Anchors, isTop?: boolean) => Set<string> | false;
  collectEvaluatedItems?: (compiledKeywordValue: A, instance: Instance, ast: AST, dynamicAnchors: Anchors, isTop?: boolean) => Set<number> | false;
  collectExternalIds?: (visited: Set<string>, parentSchema: Browser<SchemaDocument>, schema: Browser<SchemaDocument>) => Promise<Set<string>>;
  annotation?: <B>(compiledKeywordValue: A) => B;
};

export const Validation: Keyword<string>;

// PubSub
export const subscribe: <A>(message: string, fn: (message: string, data: A) => void) => string;
export const unsubscribe: (message: string, token: string) => void;
export const publish: <A>(message: string, data: A) => void;
export const publishAsync: <A>(message: string, data: A) => Promise<void>;
