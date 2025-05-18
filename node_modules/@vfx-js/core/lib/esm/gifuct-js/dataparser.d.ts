export default DataParser;
declare function DataParser(data: any): void;
declare class DataParser {
    constructor(data: any);
    stream: ByteStream;
    output: {};
    parse(schema: any): {};
    parseParts(obj: any, schema: any): void;
    parsePart(obj: any, part: any): void;
    parseBits(details: any): {};
}
import ByteStream from "./bytestream.js";
