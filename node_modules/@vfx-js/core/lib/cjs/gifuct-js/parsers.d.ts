export default Parsers;
declare namespace Parsers {
    function readByte(): (stream: any) => any;
    function readBytes(length: any): (stream: any) => any;
    function readString(length: any): (stream: any) => any;
    function readUnsigned(littleEndian: any): (stream: any) => any;
    function readArray(size: any, countFunc: any): (stream: any, obj: any, parent: any) => any[];
}
