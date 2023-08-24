var Module;
Module || (Module = (void 0 !== Module ? Module : null) || {});
var moduleOverrides = {};
for (var key in Module)
    Module.hasOwnProperty(key) && (moduleOverrides[key] = Module[key]);
var ENVIRONMENT_IS_WEB = "object" == typeof window
  , ENVIRONMENT_IS_WORKER = "function" == typeof importScripts
  , ENVIRONMENT_IS_NODE = "object" == typeof process && "function" == typeof require && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER
  , ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
    Module.print || (Module.print = function(e) {
        process.stdout.write(e + "\n")
    }
    ),
    Module.printErr || (Module.printErr = function(e) {
        process.stderr.write(e + "\n")
    }
    );
    var nodeFS = require("fs")
      , nodePath = require("path");
    Module.read = function(e, r) {
        e = nodePath.normalize(e);
        var t = nodeFS.readFileSync(e);
        return t || e == nodePath.resolve(e) || (e = path.join(__dirname, "..", "src", e),
        t = nodeFS.readFileSync(e)),
        t && !r && (t = t.toString()),
        t
    }
    ,
    Module.readBinary = function(e) {
        var r = Module.read(e, !0);
        return r.buffer || (r = new Uint8Array(r)),
        assert(r.buffer),
        r
    }
    ,
    Module.load = function(e) {
        globalEval(read(e))
    }
    ,
    Module.thisProgram || (1 < process.argv.length ? Module.thisProgram = process.argv[1].replace(/\\/g, "/") : Module.thisProgram = "unknown-program"),
    Module.arguments = process.argv.slice(2),
    "undefined" != typeof module && (module.exports = Module),
    process.on("uncaughtException", function(e) {
        if (!(e instanceof ExitStatus))
            throw e
    }),
    Module.inspect = function() {
        return "[Emscripten Module object]"
    }
} else if (ENVIRONMENT_IS_SHELL)
    Module.print || (Module.print = print),
    "undefined" != typeof printErr && (Module.printErr = printErr),
    "undefined" != typeof read ? Module.read = read : Module.read = function() {
        throw "no read() available (jsc?)"
    }
    ,
    Module.readBinary = function(e) {
        if ("function" == typeof readbuffer)
            return new Uint8Array(readbuffer(e));
        var r = read(e, "binary");
        return assert("object" == typeof r),
        r
    }
    ,
    "undefined" != typeof scriptArgs ? Module.arguments = scriptArgs : "undefined" != typeof arguments && (Module.arguments = arguments);
else {
    if (!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER)
        throw "Unknown runtime environment. Where are we?";
    if (Module.read = function(e) {
        var r = new XMLHttpRequest;
        return r.open("GET", e, !1),
        r.send(null),
        r.responseText
    }
    ,
    "undefined" != typeof arguments && (Module.arguments = arguments),
    "undefined" != typeof console)
        Module.print || (Module.print = function(e) {
            console.log(e)
        }
        ),
        Module.printErr || (Module.printErr = function(e) {
            console.log(e)
        }
        );
    else {
        var TRY_USE_DUMP = !1;
        Module.print || (Module.print = TRY_USE_DUMP && "undefined" != typeof dump ? function(e) {
            dump(e)
        }
        : function(e) {}
        )
    }
    ENVIRONMENT_IS_WORKER && (Module.load = importScripts),
    void 0 === Module.setWindowTitle && (Module.setWindowTitle = function(e) {
        document.title = e
    }
    )
}
function globalEval(e) {
    eval.call(null, e)
}
for (var key in !Module.load && Module.read && (Module.load = function(e) {
    globalEval(Module.read(e))
}
),
Module.print || (Module.print = function() {}
),
Module.printErr || (Module.printErr = Module.print),
Module.arguments || (Module.arguments = []),
Module.thisProgram || (Module.thisProgram = "./this.program"),
Module.print = Module.print,
Module.printErr = Module.printErr,
Module.preRun = [],
Module.postRun = [],
moduleOverrides)
    moduleOverrides.hasOwnProperty(key) && (Module[key] = moduleOverrides[key]);
var Runtime = {
    setTempRet0: function(e) {
        tempRet0 = e
    },
    getTempRet0: function() {
        return tempRet0
    },
    stackSave: function() {
        return STACKTOP
    },
    stackRestore: function(e) {
        STACKTOP = e
    },
    getNativeTypeSize: function(e) {
        switch (e) {
        case "i1":
        case "i8":
            return 1;
        case "i16":
            return 2;
        case "i32":
            return 4;
        case "i64":
            return 8;
        case "float":
            return 4;
        case "double":
            return 8;
        default:
            if ("*" === e[e.length - 1])
                return Runtime.QUANTUM_SIZE;
            if ("i" !== e[0])
                return 0;
            var r = parseInt(e.substr(1));
            return assert(r % 8 == 0),
            r / 8
        }
    },
    getNativeFieldSize: function(e) {
        return Math.max(Runtime.getNativeTypeSize(e), Runtime.QUANTUM_SIZE)
    },
    STACK_ALIGN: 16,
    prepVararg: function(e, r) {
        return "double" === r || "i64" === r ? 7 & e && (assert(4 == (7 & e)),
        e += 4) : assert(0 == (3 & e)),
        e
    },
    getAlignSize: function(e, r, t) {
        return t || "i64" != e && "double" != e ? e ? Math.min(r || (e ? Runtime.getNativeFieldSize(e) : 0), Runtime.QUANTUM_SIZE) : Math.min(r, 8) : 8
    },
    dynCall: function(e, r, t) {
        return t && t.length ? (assert(t.length == e.length - 1),
        t.splice || (t = Array.prototype.slice.call(t)),
        t.splice(0, 0, r),
        assert("dynCall_" + e in Module, "bad function pointer type - no table for sig '" + e + "'"),
        Module["dynCall_" + e].apply(null, t)) : (assert(1 == e.length),
        assert("dynCall_" + e in Module, "bad function pointer type - no table for sig '" + e + "'"),
        Module["dynCall_" + e].call(null, r))
    },
    functionPointers: [],
    addFunction: function(e) {
        for (var r = 0; r < Runtime.functionPointers.length; r++)
            if (!Runtime.functionPointers[r])
                return Runtime.functionPointers[r] = e,
                2 * (1 + r);
        throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."
    },
    removeFunction: function(e) {
        Runtime.functionPointers[(e - 2) / 2] = null
    },
    warnOnce: function(e) {
        Runtime.warnOnce.shown || (Runtime.warnOnce.shown = {}),
        Runtime.warnOnce.shown[e] || (Runtime.warnOnce.shown[e] = 1,
        Module.printErr(e))
    },
    funcWrappers: {},
    getFuncWrapper: function(e, r) {
        assert(r),
        Runtime.funcWrappers[r] || (Runtime.funcWrappers[r] = {});
        var t = Runtime.funcWrappers[r];
        return t[e] || (t[e] = function() {
            return Runtime.dynCall(r, e, arguments)
        }
        ),
        t[e]
    },
    getCompilerSetting: function(e) {
        throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"
    },
    stackAlloc: function(e) {
        var r = STACKTOP;
        return assert((0 | (STACKTOP = (STACKTOP = STACKTOP + e | 0) + 15 & -16)) < (0 | STACK_MAX) | 0),
        r
    },
    staticAlloc: function(e) {
        var r = STATICTOP;
        return STATICTOP = (STATICTOP = STATICTOP + (assert(!staticSealed),
        e) | 0) + 15 & -16,
        r
    },
    dynamicAlloc: function(e) {
        var r = DYNAMICTOP;
        if ((DYNAMICTOP = DYNAMICTOP + (assert(0 < DYNAMICTOP),
        e) | 0,
        TOTAL_MEMORY <= (DYNAMICTOP = DYNAMICTOP + 15 & -16)) && !enlargeMemory())
            return DYNAMICTOP = r,
            0;
        return r
    },
    alignMemory: function(e, r) {
        return e = Math.ceil(e / (r || 16)) * (r || 16)
    },
    makeBigInt: function(e, r, t) {
        return t ? +(e >>> 0) + 4294967296 * +(r >>> 0) : +(e >>> 0) + 4294967296 * +(0 | r)
    },
    GLOBAL_BASE: 8,
    QUANTUM_SIZE: 4,
    __dummy__: 0
};
Module.Runtime = Runtime;
var __THREW__ = 0, ABORT = !1, EXITSTATUS = 0, undef = 0, tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat, tempI64, tempI64b, tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(e, r) {
    e || abort("Assertion failed: " + r)
}
var globalScope = this, cwrap, ccall;
function getCFunc(ident) {
    var func = Module["_" + ident];
    if (!func)
        try {
            func = eval("_" + ident)
        } catch (e) {}
    return assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)"),
    func
}
function setValue(e, r, t, n) {
    switch ("*" === (t = t || "i8").charAt(t.length - 1) && (t = "i32"),
    t) {
    case "i1":
    case "i8":
        HEAP8[e >> 0] = r;
        break;
    case "i16":
        HEAP16[e >> 1] = r;
        break;
    case "i32":
        HEAP32[e >> 2] = r;
        break;
    case "i64":
        tempI64 = [r >>> 0, (tempDouble = r,
        1 <= +Math_abs(tempDouble) ? 0 < tempDouble ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
        HEAP32[e >> 2] = tempI64[0],
        HEAP32[e + 4 >> 2] = tempI64[1];
        break;
    case "float":
        HEAPF32[e >> 2] = r;
        break;
    case "double":
        HEAPF64[e >> 3] = r;
        break;
    default:
        abort("invalid type for setValue: " + t)
    }
}
function getValue(e, r, t) {
    switch ("*" === (r = r || "i8").charAt(r.length - 1) && (r = "i32"),
    r) {
    case "i1":
    case "i8":
        return HEAP8[e >> 0];
    case "i16":
        return HEAP16[e >> 1];
    case "i32":
    case "i64":
        return HEAP32[e >> 2];
    case "float":
        return HEAPF32[e >> 2];
    case "double":
        return HEAPF64[e >> 3];
    default:
        abort("invalid type for setValue: " + r)
    }
    return null
}
!function() {
    var JSfuncs = {
        stackSave: function() {
            Runtime.stackSave()
        },
        stackRestore: function() {
            Runtime.stackRestore()
        },
        arrayToC: function(e) {
            var r = Runtime.stackAlloc(e.length);
            return writeArrayToMemory(e, r),
            r
        },
        stringToC: function(e) {
            var r = 0;
            return null != e && 0 !== e && writeStringToMemory(e, r = Runtime.stackAlloc(1 + (e.length << 2))),
            r
        }
    }
      , toC = {
        string: JSfuncs.stringToC,
        array: JSfuncs.arrayToC
    };
    ccall = function(e, r, t, n, o) {
        var i = getCFunc(e)
          , a = []
          , s = 0;
        if (assert("array" !== r, 'Return type should not be "array".'),
        n)
            for (var u = 0; u < n.length; u++) {
                var l = toC[t[u]];
                l ? (0 === s && (s = Runtime.stackSave()),
                a[u] = l(n[u])) : a[u] = n[u]
            }
        var c = i.apply(null, a);
        if (o && o.async || "object" != typeof EmterpreterAsync || assert(!EmterpreterAsync.state, "cannot start async op with normal JS calling ccall"),
        o && o.async && assert(!r, "async ccalls cannot return values"),
        "string" === r && (c = Pointer_stringify(c)),
        0 !== s) {
            if (o && o.async)
                return void EmterpreterAsync.asyncFinalizers.push(function() {
                    Runtime.stackRestore(s)
                });
            Runtime.stackRestore(s)
        }
        return c
    }
    ;
    var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
    function parseJSFunc(e) {
        var r = e.toString().match(sourceRegex).slice(1);
        return {
            arguments: r[0],
            body: r[1],
            returnValue: r[2]
        }
    }
    var JSsource = {};
    for (var fun in JSfuncs)
        JSfuncs.hasOwnProperty(fun) && (JSsource[fun] = parseJSFunc(JSfuncs[fun]));
    cwrap = function cwrap(ident, returnType, argTypes) {
        argTypes = argTypes || [];
        var cfunc = getCFunc(ident)
          , numericArgs = argTypes.every(function(e) {
            return "number" === e
        })
          , numericRet = "string" !== returnType;
        if (numericRet && numericArgs)
            return cfunc;
        var argNames = argTypes.map(function(e, r) {
            return "$" + r
        })
          , funcstr = "(function(" + argNames.join(",") + ") {"
          , nargs = argTypes.length;
        if (!numericArgs) {
            funcstr += "var stack = " + JSsource.stackSave.body + ";";
            for (var i = 0; i < nargs; i++) {
                var arg = argNames[i]
                  , type = argTypes[i];
                if ("number" !== type) {
                    var convertCode = JSsource[type + "ToC"];
                    funcstr += "var " + convertCode.arguments + " = " + arg + ";",
                    funcstr += convertCode.body + ";",
                    funcstr += arg + "=" + convertCode.returnValue + ";"
                }
            }
        }
        var cfuncname = parseJSFunc(function() {
            return cfunc
        }).returnValue;
        if (funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");",
        !numericRet) {
            var strgfy = parseJSFunc(function() {
                return Pointer_stringify
            }).returnValue;
            funcstr += "ret = " + strgfy + "(ret);"
        }
        return funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }",
        numericArgs || (funcstr += JSsource.stackRestore.body.replace("()", "(stack)") + ";"),
        funcstr += "return ret})",
        eval(funcstr)
    }
}(),
Module.ccall = ccall,
Module.cwrap = cwrap,
Module.setValue = setValue,
Module.getValue = getValue;
var ALLOC_NORMAL = 0
  , ALLOC_STACK = 1
  , ALLOC_STATIC = 2
  , ALLOC_DYNAMIC = 3
  , ALLOC_NONE = 4;
function allocate(e, r, t, n) {
    var o, i;
    i = "number" == typeof e ? (o = !0,
    e) : (o = !1,
    e.length);
    var a, s = "string" == typeof r ? r : null;
    if (a = t == ALLOC_NONE ? n : [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][void 0 === t ? ALLOC_STATIC : t](Math.max(i, s ? 1 : r.length)),
    o) {
        var u;
        n = a;
        for (assert(0 == (3 & a)),
        u = a + (-4 & i); n < u; n += 4)
            HEAP32[n >> 2] = 0;
        for (u = a + i; n < u; )
            HEAP8[n++ >> 0] = 0;
        return a
    }
    if ("i8" === s)
        return e.subarray || e.slice ? HEAPU8.set(e, a) : HEAPU8.set(new Uint8Array(e), a),
        a;
    for (var l, c, d, f = 0; f < i; ) {
        var m = e[f];
        "function" == typeof m && (m = Runtime.getFunctionIndex(m)),
        0 !== (l = s || r[f]) ? (assert(l, "Must know what type to store in allocate!"),
        "i64" == l && (l = "i32"),
        setValue(a + f, m, l),
        d !== l && (c = Runtime.getNativeTypeSize(l),
        d = l),
        f += c) : f++
    }
    return a
}
function getMemory(e) {
    return staticSealed ? void 0 !== _sbrk && !_sbrk.called || !runtimeInitialized ? Runtime.dynamicAlloc(e) : _malloc(e) : Runtime.staticAlloc(e)
}
function Pointer_stringify(e, r) {
    if (0 === r || !e)
        return "";
    for (var t, n = 0, o = 0; assert(e + o < TOTAL_MEMORY),
    n |= t = HEAPU8[e + o >> 0],
    (0 != t || r) && (o++,
    !r || o != r); )
        ;
    r || (r = o);
    var i = "";
    if (n < 128) {
        for (var a; 0 < r; )
            a = String.fromCharCode.apply(String, HEAPU8.subarray(e, e + Math.min(r, 1024))),
            i = i ? i + a : a,
            e += 1024,
            r -= 1024;
        return i
    }
    return Module.UTF8ToString(e)
}
function AsciiToString(e) {
    for (var r = ""; ; ) {
        var t = HEAP8[e++ >> 0];
        if (!t)
            return r;
        r += String.fromCharCode(t)
    }
}
function stringToAscii(e, r) {
    return writeAsciiToMemory(e, r, !1)
}
function UTF8ArrayToString(e, r) {
    for (var t, n, o, i, a, s = ""; ; ) {
        if (!(t = e[r++]))
            return s;
        if (128 & t)
            if (n = 63 & e[r++],
            192 != (224 & t))
                if (o = 63 & e[r++],
                (t = 224 == (240 & t) ? (15 & t) << 12 | n << 6 | o : (i = 63 & e[r++],
                240 == (248 & t) ? (7 & t) << 18 | n << 12 | o << 6 | i : (a = 63 & e[r++],
                248 == (252 & t) ? (3 & t) << 24 | n << 18 | o << 12 | i << 6 | a : (1 & t) << 30 | n << 24 | o << 18 | i << 12 | a << 6 | 63 & e[r++]))) < 65536)
                    s += String.fromCharCode(t);
                else {
                    var u = t - 65536;
                    s += String.fromCharCode(55296 | u >> 10, 56320 | 1023 & u)
                }
            else
                s += String.fromCharCode((31 & t) << 6 | n);
        else
            s += String.fromCharCode(t)
    }
}
function UTF8ToString(e) {
    return UTF8ArrayToString(HEAPU8, e)
}
function stringToUTF8Array(e, r, t, n) {
    if (!(0 < n))
        return 0;
    for (var o = t, i = t + n - 1, a = 0; a < e.length; ++a) {
        var s = e.charCodeAt(a);
        if (55296 <= s && s <= 57343 && (s = 65536 + ((1023 & s) << 10) | 1023 & e.charCodeAt(++a)),
        s <= 127) {
            if (i <= t)
                break;
            r[t++] = s
        } else if (s <= 2047) {
            if (i <= t + 1)
                break;
            r[t++] = 192 | s >> 6,
            r[t++] = 128 | 63 & s
        } else if (s <= 65535) {
            if (i <= t + 2)
                break;
            r[t++] = 224 | s >> 12,
            r[t++] = 128 | s >> 6 & 63,
            r[t++] = 128 | 63 & s
        } else if (s <= 2097151) {
            if (i <= t + 3)
                break;
            r[t++] = 240 | s >> 18,
            r[t++] = 128 | s >> 12 & 63,
            r[t++] = 128 | s >> 6 & 63,
            r[t++] = 128 | 63 & s
        } else if (s <= 67108863) {
            if (i <= t + 4)
                break;
            r[t++] = 248 | s >> 24,
            r[t++] = 128 | s >> 18 & 63,
            r[t++] = 128 | s >> 12 & 63,
            r[t++] = 128 | s >> 6 & 63,
            r[t++] = 128 | 63 & s
        } else {
            if (i <= t + 5)
                break;
            r[t++] = 252 | s >> 30,
            r[t++] = 128 | s >> 24 & 63,
            r[t++] = 128 | s >> 18 & 63,
            r[t++] = 128 | s >> 12 & 63,
            r[t++] = 128 | s >> 6 & 63,
            r[t++] = 128 | 63 & s
        }
    }
    return r[t] = 0,
    t - o
}
function stringToUTF8(e, r, t) {
    return assert("number" == typeof t, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),
    stringToUTF8Array(e, HEAPU8, r, t)
}
function lengthBytesUTF8(e) {
    for (var r = 0, t = 0; t < e.length; ++t) {
        var n = e.charCodeAt(t);
        55296 <= n && n <= 57343 && (n = 65536 + ((1023 & n) << 10) | 1023 & e.charCodeAt(++t)),
        n <= 127 ? ++r : r += n <= 2047 ? 2 : n <= 65535 ? 3 : n <= 2097151 ? 4 : n <= 67108863 ? 5 : 6
    }
    return r
}
function UTF16ToString(e) {
    for (var r = 0, t = ""; ; ) {
        var n = HEAP16[e + 2 * r >> 1];
        if (0 == n)
            return t;
        ++r,
        t += String.fromCharCode(n)
    }
}
function stringToUTF16(e, r, t) {
    if (assert("number" == typeof t, "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),
    void 0 === t && (t = 2147483647),
    t < 2)
        return 0;
    for (var n = r, o = (t -= 2) < 2 * e.length ? t / 2 : e.length, i = 0; i < o; ++i) {
        var a = e.charCodeAt(i);
        HEAP16[r >> 1] = a,
        r += 2
    }
    return HEAP16[r >> 1] = 0,
    r - n
}
function lengthBytesUTF16(e) {
    return 2 * e.length
}
function UTF32ToString(e) {
    for (var r = 0, t = ""; ; ) {
        var n = HEAP32[e + 4 * r >> 2];
        if (0 == n)
            return t;
        if (++r,
        65536 <= n) {
            var o = n - 65536;
            t += String.fromCharCode(55296 | o >> 10, 56320 | 1023 & o)
        } else
            t += String.fromCharCode(n)
    }
}
function stringToUTF32(e, r, t) {
    if (assert("number" == typeof t, "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),
    void 0 === t && (t = 2147483647),
    t < 4)
        return 0;
    for (var n = r, o = n + t - 4, i = 0; i < e.length; ++i) {
        var a = e.charCodeAt(i);
        if (55296 <= a && a <= 57343)
            a = 65536 + ((1023 & a) << 10) | 1023 & e.charCodeAt(++i);
        if (HEAP32[r >> 2] = a,
        o < (r += 4) + 4)
            break
    }
    return HEAP32[r >> 2] = 0,
    r - n
}
function lengthBytesUTF32(e) {
    for (var r = 0, t = 0; t < e.length; ++t) {
        var n = e.charCodeAt(t);
        55296 <= n && n <= 57343 && ++t,
        r += 4
    }
    return r
}
function demangle(d) {
    var e = !!Module.___cxa_demangle;
    if (e)
        try {
            var r = _malloc(d.length);
            writeStringToMemory(d.substr(1), r);
            var t = _malloc(4)
              , n = Module.___cxa_demangle(r, 0, 0, t);
            if (0 === getValue(t, "i32") && n)
                return Pointer_stringify(n)
        } catch (e) {} finally {
            r && _free(r),
            t && _free(t),
            n && _free(n)
        }
    var f = 3
      , m = {
        v: "void",
        b: "bool",
        c: "char",
        s: "short",
        i: "int",
        l: "long",
        f: "float",
        d: "double",
        w: "wchar_t",
        a: "signed char",
        h: "unsigned char",
        t: "unsigned short",
        j: "unsigned int",
        m: "unsigned long",
        x: "long long",
        y: "unsigned long long",
        z: "..."
    }
      , E = []
      , S = !0;
    var o = d;
    try {
        if ("Object._main" == d || "_main" == d)
            return "main()";
        if ("number" == typeof d && (d = Pointer_stringify(d)),
        "_" !== d[0])
            return d;
        if ("_" !== d[1])
            return d;
        if ("Z" !== d[2])
            return d;
        switch (d[3]) {
        case "n":
            return "operator new()";
        case "d":
            return "operator delete()"
        }
        o = function e(r, t, n) {
            t = t || 1 / 0;
            var o, i = "", a = [];
            if ("N" === d[f]) {
                if (o = function() {
                    "K" === d[++f] && f++;
                    for (var e = []; "E" !== d[f]; )
                        if ("S" !== d[f])
                            if ("C" !== d[f]) {
                                var r = parseInt(d.substr(f))
                                  , t = r.toString().length;
                                if (!r || !t) {
                                    f--;
                                    break
                                }
                                var n = d.substr(f + t, r);
                                e.push(n),
                                E.push(n),
                                f += t + r
                            } else
                                e.push(e[e.length - 1]),
                                f += 2;
                        else {
                            f++;
                            var o = d.indexOf("_", f)
                              , i = d.substring(f, o) || 0;
                            e.push(E[i] || "?"),
                            f = o + 1
                        }
                    return f++,
                    e
                }().join("::"),
                0 == --t)
                    return r ? [o] : o
            } else if (("K" === d[f] || S && "L" === d[f]) && f++,
            c = parseInt(d.substr(f))) {
                var s = c.toString().length;
                o = d.substr(f + s, c),
                f += s + c
            }
            if (S = !1,
            "I" === d[f]) {
                f++;
                var u = e(!0);
                i += e(!0, 1, !0)[0] + " " + o + "<" + u.join(", ") + ">"
            } else
                i = o;
            e: for (; f < d.length && 0 < t--; ) {
                var l = d[f++];
                if (l in m)
                    a.push(m[l]);
                else
                    switch (l) {
                    case "P":
                        a.push(e(!0, 1, !0)[0] + "*");
                        break;
                    case "R":
                        a.push(e(!0, 1, !0)[0] + "&");
                        break;
                    case "L":
                        f++;
                        var c = d.indexOf("E", f) - f;
                        a.push(d.substr(f, c)),
                        f += c + 2;
                        break;
                    case "A":
                        if (c = parseInt(d.substr(f)),
                        f += c.toString().length,
                        "_" !== d[f])
                            throw "?";
                        f++,
                        a.push(e(!0, 1, !0)[0] + " [" + c + "]");
                        break;
                    case "E":
                        break e;
                    default:
                        i += "?" + l;
                        break e
                    }
            }
            return n || 1 !== a.length || "void" !== a[0] || (a = []),
            r ? (i && a.push(i + "?"),
            a) : i + "(" + a.join(", ") + ")"
        }()
    } catch (e) {
        o += "?"
    }
    return 0 <= o.indexOf("?") && !e && Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling"),
    o
}
function demangleAll(e) {
    return e.replace(/__Z[\w\d_]+/g, function(e) {
        var r = demangle(e);
        return e === r ? e : e + " [" + r + "]"
    })
}
function jsStackTrace() {
    var r = new Error;
    if (!r.stack) {
        try {
            throw new Error(0)
        } catch (e) {
            r = e
        }
        if (!r.stack)
            return "(no stack trace available)"
    }
    return r.stack.toString()
}
function stackTrace() {
    return demangleAll(jsStackTrace())
}
Module.ALLOC_NORMAL = ALLOC_NORMAL,
Module.ALLOC_STACK = ALLOC_STACK,
Module.ALLOC_STATIC = ALLOC_STATIC,
Module.ALLOC_DYNAMIC = ALLOC_DYNAMIC,
Module.ALLOC_NONE = ALLOC_NONE,
Module.allocate = allocate,
Module.getMemory = getMemory,
Module.Pointer_stringify = Pointer_stringify,
Module.AsciiToString = AsciiToString,
Module.stringToAscii = stringToAscii,
Module.UTF8ArrayToString = UTF8ArrayToString,
Module.UTF8ToString = UTF8ToString,
Module.stringToUTF8Array = stringToUTF8Array,
Module.stringToUTF8 = stringToUTF8,
Module.lengthBytesUTF8 = lengthBytesUTF8,
Module.UTF16ToString = UTF16ToString,
Module.stringToUTF16 = stringToUTF16,
Module.lengthBytesUTF16 = lengthBytesUTF16,
Module.UTF32ToString = UTF32ToString,
Module.stringToUTF32 = stringToUTF32,
Module.lengthBytesUTF32 = lengthBytesUTF32,
Module.stackTrace = stackTrace;
var PAGE_SIZE = 4096, HEAP, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function alignMemoryPage(e) {
    return 0 < e % 4096 && (e += 4096 - e % 4096),
    e
}
var STATIC_BASE = 0
  , STATICTOP = 0
  , staticSealed = !1
  , STACK_BASE = 0
  , STACKTOP = 0
  , STACK_MAX = 0
  , DYNAMIC_BASE = 0
  , DYNAMICTOP = 0;
function abortOnCannotGrowMemory() {
    abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}
function enlargeMemory() {
    abortOnCannotGrowMemory()
}
for (var TOTAL_STACK = Module.TOTAL_STACK || 5242880, TOTAL_MEMORY = Module.TOTAL_MEMORY || 16777216, totalMemory = 65536, buffer; totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK; )
    totalMemory < 16777216 ? totalMemory *= 2 : totalMemory += 16777216;
function callRuntimeCallbacks(e) {
    for (; 0 < e.length; ) {
        var r = e.shift();
        if ("function" != typeof r) {
            var t = r.func;
            "number" == typeof t ? void 0 === r.arg ? Runtime.dynCall("v", t) : Runtime.dynCall("vi", t, [r.arg]) : t(void 0 === r.arg ? null : r.arg)
        } else
            r()
    }
}
totalMemory !== TOTAL_MEMORY && (Module.printErr("increasing TOTAL_MEMORY to " + totalMemory + " to be compliant with the asm.js spec (and given that TOTAL_STACK=" + TOTAL_STACK + ")"),
TOTAL_MEMORY = totalMemory),
assert("undefined" != typeof Int32Array && "undefined" != typeof Float64Array && !!new Int32Array(1).subarray && !!new Int32Array(1).set, "JS engine does not provide full typed array support"),
buffer = new ArrayBuffer(TOTAL_MEMORY),
HEAP8 = new Int8Array(buffer),
HEAP16 = new Int16Array(buffer),
HEAP32 = new Int32Array(buffer),
HEAPU8 = new Uint8Array(buffer),
HEAPU16 = new Uint16Array(buffer),
HEAPU32 = new Uint32Array(buffer),
HEAPF32 = new Float32Array(buffer),
HEAPF64 = new Float64Array(buffer),
HEAP32[0] = 255,
assert(255 === HEAPU8[0] && 0 === HEAPU8[3], "Typed arrays 2 must be run on a little-endian system"),
Module.HEAP = HEAP,
Module.buffer = buffer,
Module.HEAP8 = HEAP8,
Module.HEAP16 = HEAP16,
Module.HEAP32 = HEAP32,
Module.HEAPU8 = HEAPU8,
Module.HEAPU16 = HEAPU16,
Module.HEAPU32 = HEAPU32,
Module.HEAPF32 = HEAPF32,
Module.HEAPF64 = HEAPF64;
var __ATPRERUN__ = []
  , __ATINIT__ = []
  , __ATMAIN__ = []
  , __ATEXIT__ = []
  , __ATPOSTRUN__ = []
  , runtimeInitialized = !1
  , runtimeExited = !1;
function preRun() {
    if (Module.preRun)
        for ("function" == typeof Module.preRun && (Module.preRun = [Module.preRun]); Module.preRun.length; )
            addOnPreRun(Module.preRun.shift());
    callRuntimeCallbacks(__ATPRERUN__)
}
function ensureInitRuntime() {
    runtimeInitialized || (runtimeInitialized = !0,
    callRuntimeCallbacks(__ATINIT__))
}
function preMain() {
    callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
    callRuntimeCallbacks(__ATEXIT__),
    runtimeExited = !0
}
function postRun() {
    if (Module.postRun)
        for ("function" == typeof Module.postRun && (Module.postRun = [Module.postRun]); Module.postRun.length; )
            addOnPostRun(Module.postRun.shift());
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(e) {
    __ATPRERUN__.unshift(e)
}
function addOnInit(e) {
    __ATINIT__.unshift(e)
}
function addOnPreMain(e) {
    __ATMAIN__.unshift(e)
}
function addOnExit(e) {
    __ATEXIT__.unshift(e)
}
function addOnPostRun(e) {
    __ATPOSTRUN__.unshift(e)
}
function intArrayFromString(e, r, t) {
    var n = 0 < t ? t : lengthBytesUTF8(e) + 1
      , o = new Array(n)
      , i = stringToUTF8Array(e, o, 0, o.length);
    return r && (o.length = i),
    o
}
function intArrayToString(e) {
    for (var r = [], t = 0; t < e.length; t++) {
        var n = e[t];
        255 < n && (assert(!1, "Character code " + n + " (" + String.fromCharCode(n) + ")  at offset " + t + " not in 0x00-0xFF."),
        n &= 255),
        r.push(String.fromCharCode(n))
    }
    return r.join("")
}
function writeStringToMemory(e, r, t) {
    for (var n = intArrayFromString(e, t), o = 0; o < n.length; ) {
        var i = n[o];
        HEAP8[r + o >> 0] = i,
        o += 1
    }
}
function writeArrayToMemory(e, r) {
    for (var t = 0; t < e.length; t++)
        HEAP8[r++ >> 0] = e[t]
}
function writeAsciiToMemory(e, r, t) {
    for (var n = 0; n < e.length; ++n)
        assert(e.charCodeAt(n) == e.charCodeAt(n) & 255),
        HEAP8[r++ >> 0] = e.charCodeAt(n);
    t || (HEAP8[r >> 0] = 0)
}
function unSign(e, r, t) {
    return 0 <= e ? e : r <= 32 ? 2 * Math.abs(1 << r - 1) + e : Math.pow(2, r) + e
}
function reSign(e, r, t) {
    if (e <= 0)
        return e;
    var n = r <= 32 ? Math.abs(1 << r - 1) : Math.pow(2, r - 1);
    return n <= e && (r <= 32 || n < e) && (e = -2 * n + e),
    e
}
Module.addOnPreRun = addOnPreRun,
Module.addOnInit = addOnInit,
Module.addOnPreMain = addOnPreMain,
Module.addOnExit = addOnExit,
Module.addOnPostRun = addOnPostRun,
Module.intArrayFromString = intArrayFromString,
Module.intArrayToString = intArrayToString,
Module.writeStringToMemory = writeStringToMemory,
Module.writeArrayToMemory = writeArrayToMemory,
Module.writeAsciiToMemory = writeAsciiToMemory,
Math.imul && -5 === Math.imul(4294967295, 5) || (Math.imul = function(e, r) {
    var t = 65535 & e
      , n = 65535 & r;
    return t * n + ((e >>> 16) * n + t * (r >>> 16) << 16) | 0
}
),
Math.imul = Math.imul,
Math.clz32 || (Math.clz32 = function(e) {
    e >>>= 0;
    for (var r = 0; r < 32; r++)
        if (e & 1 << 31 - r)
            return r;
    return 32
}
),
Math.clz32 = Math.clz32;
var Math_abs = Math.abs
  , Math_cos = Math.cos
  , Math_sin = Math.sin
  , Math_tan = Math.tan
  , Math_acos = Math.acos
  , Math_asin = Math.asin
  , Math_atan = Math.atan
  , Math_atan2 = Math.atan2
  , Math_exp = Math.exp
  , Math_log = Math.log
  , Math_sqrt = Math.sqrt
  , Math_ceil = Math.ceil
  , Math_floor = Math.floor
  , Math_pow = Math.pow
  , Math_imul = Math.imul
  , Math_fround = Math.fround
  , Math_min = Math.min
  , Math_clz32 = Math.clz32
  , runDependencies = 0
  , runDependencyWatcher = null
  , dependenciesFulfilled = null
  , runDependencyTracking = {};
function getUniqueRunDependency(e) {
    for (var r = e; ; ) {
        if (!runDependencyTracking[e])
            return e;
        e = r + Math.random()
    }
    return e
}
function addRunDependency(e) {
    runDependencies++,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    e ? (assert(!runDependencyTracking[e]),
    runDependencyTracking[e] = 1,
    null === runDependencyWatcher && "undefined" != typeof setInterval && (runDependencyWatcher = setInterval(function() {
        if (ABORT)
            return clearInterval(runDependencyWatcher),
            void (runDependencyWatcher = null);
        var e = !1;
        for (var r in runDependencyTracking)
            e || (e = !0,
            Module.printErr("still waiting on run dependencies:")),
            Module.printErr("dependency: " + r);
        e && Module.printErr("(end of list)")
    }, 1e4))) : Module.printErr("warning: run dependency added without ID")
}
function removeRunDependency(e) {
    if (runDependencies--,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    e ? (assert(runDependencyTracking[e]),
    delete runDependencyTracking[e]) : Module.printErr("warning: run dependency removed without ID"),
    0 == runDependencies && (null !== runDependencyWatcher && (clearInterval(runDependencyWatcher),
    runDependencyWatcher = null),
    dependenciesFulfilled)) {
        var r = dependenciesFulfilled;
        dependenciesFulfilled = null,
        r()
    }
}
Module.addRunDependency = addRunDependency,
Module.removeRunDependency = removeRunDependency,
Module.preloadedImages = {},
Module.preloadedAudios = {};
var memoryInitializer = null
  , ASM_CONSTS = [];
STATIC_BASE = 8,
STATICTOP = STATIC_BASE + 1712,
__ATINIT__.push(),
allocate([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 180, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 1, 255, 3, 255, 7, 255, 15, 255, 31, 255, 63, 255, 127, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
function copyTempFloat(e) {
    HEAP8[tempDoublePtr] = HEAP8[e],
    HEAP8[tempDoublePtr + 1] = HEAP8[e + 1],
    HEAP8[tempDoublePtr + 2] = HEAP8[e + 2],
    HEAP8[tempDoublePtr + 3] = HEAP8[e + 3]
}
function copyTempDouble(e) {
    HEAP8[tempDoublePtr] = HEAP8[e],
    HEAP8[tempDoublePtr + 1] = HEAP8[e + 1],
    HEAP8[tempDoublePtr + 2] = HEAP8[e + 2],
    HEAP8[tempDoublePtr + 3] = HEAP8[e + 3],
    HEAP8[tempDoublePtr + 4] = HEAP8[e + 4],
    HEAP8[tempDoublePtr + 5] = HEAP8[e + 5],
    HEAP8[tempDoublePtr + 6] = HEAP8[e + 6],
    HEAP8[tempDoublePtr + 7] = HEAP8[e + 7]
}
function ___setErrNo(e) {
    return Module.___errno_location ? HEAP32[Module.___errno_location() >> 2] = e : Module.printErr("failed to set errno from JS"),
    e
}
assert(tempDoublePtr % 8 == 0);
var ERRNO_CODES = {
    EPERM: 1,
    ENOENT: 2,
    ESRCH: 3,
    EINTR: 4,
    EIO: 5,
    ENXIO: 6,
    E2BIG: 7,
    ENOEXEC: 8,
    EBADF: 9,
    ECHILD: 10,
    EAGAIN: 11,
    EWOULDBLOCK: 11,
    ENOMEM: 12,
    EACCES: 13,
    EFAULT: 14,
    ENOTBLK: 15,
    EBUSY: 16,
    EEXIST: 17,
    EXDEV: 18,
    ENODEV: 19,
    ENOTDIR: 20,
    EISDIR: 21,
    EINVAL: 22,
    ENFILE: 23,
    EMFILE: 24,
    ENOTTY: 25,
    ETXTBSY: 26,
    EFBIG: 27,
    ENOSPC: 28,
    ESPIPE: 29,
    EROFS: 30,
    EMLINK: 31,
    EPIPE: 32,
    EDOM: 33,
    ERANGE: 34,
    ENOMSG: 42,
    EIDRM: 43,
    ECHRNG: 44,
    EL2NSYNC: 45,
    EL3HLT: 46,
    EL3RST: 47,
    ELNRNG: 48,
    EUNATCH: 49,
    ENOCSI: 50,
    EL2HLT: 51,
    EDEADLK: 35,
    ENOLCK: 37,
    EBADE: 52,
    EBADR: 53,
    EXFULL: 54,
    ENOANO: 55,
    EBADRQC: 56,
    EBADSLT: 57,
    EDEADLOCK: 35,
    EBFONT: 59,
    ENOSTR: 60,
    ENODATA: 61,
    ETIME: 62,
    ENOSR: 63,
    ENONET: 64,
    ENOPKG: 65,
    EREMOTE: 66,
    ENOLINK: 67,
    EADV: 68,
    ESRMNT: 69,
    ECOMM: 70,
    EPROTO: 71,
    EMULTIHOP: 72,
    EDOTDOT: 73,
    EBADMSG: 74,
    ENOTUNIQ: 76,
    EBADFD: 77,
    EREMCHG: 78,
    ELIBACC: 79,
    ELIBBAD: 80,
    ELIBSCN: 81,
    ELIBMAX: 82,
    ELIBEXEC: 83,
    ENOSYS: 38,
    ENOTEMPTY: 39,
    ENAMETOOLONG: 36,
    ELOOP: 40,
    EOPNOTSUPP: 95,
    EPFNOSUPPORT: 96,
    ECONNRESET: 104,
    ENOBUFS: 105,
    EAFNOSUPPORT: 97,
    EPROTOTYPE: 91,
    ENOTSOCK: 88,
    ENOPROTOOPT: 92,
    ESHUTDOWN: 108,
    ECONNREFUSED: 111,
    EADDRINUSE: 98,
    ECONNABORTED: 103,
    ENETUNREACH: 101,
    ENETDOWN: 100,
    ETIMEDOUT: 110,
    EHOSTDOWN: 112,
    EHOSTUNREACH: 113,
    EINPROGRESS: 115,
    EALREADY: 114,
    EDESTADDRREQ: 89,
    EMSGSIZE: 90,
    EPROTONOSUPPORT: 93,
    ESOCKTNOSUPPORT: 94,
    EADDRNOTAVAIL: 99,
    ENETRESET: 102,
    EISCONN: 106,
    ENOTCONN: 107,
    ETOOMANYREFS: 109,
    EUSERS: 87,
    EDQUOT: 122,
    ESTALE: 116,
    ENOTSUP: 95,
    ENOMEDIUM: 123,
    EILSEQ: 84,
    EOVERFLOW: 75,
    ECANCELED: 125,
    ENOTRECOVERABLE: 131,
    EOWNERDEAD: 130,
    ESTRPIPE: 86
};
function _sysconf(e) {
    switch (e) {
    case 30:
        return PAGE_SIZE;
    case 85:
        return totalMemory / PAGE_SIZE;
    case 132:
    case 133:
    case 12:
    case 137:
    case 138:
    case 15:
    case 235:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 149:
    case 13:
    case 10:
    case 236:
    case 153:
    case 9:
    case 21:
    case 22:
    case 159:
    case 154:
    case 14:
    case 77:
    case 78:
    case 139:
    case 80:
    case 81:
    case 82:
    case 68:
    case 67:
    case 164:
    case 11:
    case 29:
    case 47:
    case 48:
    case 95:
    case 52:
    case 51:
    case 46:
        return 200809;
    case 79:
        return 0;
    case 27:
    case 246:
    case 127:
    case 128:
    case 23:
    case 24:
    case 160:
    case 161:
    case 181:
    case 182:
    case 242:
    case 183:
    case 184:
    case 243:
    case 244:
    case 245:
    case 165:
    case 178:
    case 179:
    case 49:
    case 50:
    case 168:
    case 169:
    case 175:
    case 170:
    case 171:
    case 172:
    case 97:
    case 76:
    case 32:
    case 173:
    case 35:
        return -1;
    case 176:
    case 177:
    case 7:
    case 155:
    case 8:
    case 157:
    case 125:
    case 126:
    case 92:
    case 93:
    case 129:
    case 130:
    case 131:
    case 94:
    case 91:
        return 1;
    case 74:
    case 60:
    case 69:
    case 70:
    case 4:
        return 1024;
    case 31:
    case 42:
    case 72:
        return 32;
    case 87:
    case 26:
    case 33:
        return 2147483647;
    case 34:
    case 1:
        return 47839;
    case 38:
    case 36:
        return 99;
    case 43:
    case 37:
        return 2048;
    case 0:
        return 2097152;
    case 3:
        return 65536;
    case 28:
        return 32768;
    case 44:
        return 32767;
    case 75:
        return 16384;
    case 39:
        return 1e3;
    case 89:
        return 700;
    case 71:
        return 256;
    case 40:
        return 255;
    case 2:
        return 100;
    case 180:
        return 64;
    case 25:
        return 20;
    case 5:
        return 16;
    case 6:
        return 6;
    case 73:
        return 4;
    case 84:
        return "object" == typeof navigator && navigator.hardwareConcurrency || 1
    }
    return ___setErrNo(ERRNO_CODES.EINVAL),
    -1
}
function _pthread_cleanup_push(e, r) {
    __ATEXIT__.push(function() {
        Runtime.dynCall("vi", e, [r])
    }),
    _pthread_cleanup_push.level = __ATEXIT__.length
}
function _pthread_cleanup_pop() {
    assert(_pthread_cleanup_push.level == __ATEXIT__.length, "cannot pop if something else added meanwhile!"),
    __ATEXIT__.pop(),
    _pthread_cleanup_push.level = __ATEXIT__.length
}
function _abort() {
    Module.abort()
}
function ___lock() {}
function ___unlock() {}
Module._memset = _memset;
var ERRNO_MESSAGES = {
    0: "Success",
    1: "Not super-user",
    2: "No such file or directory",
    3: "No such process",
    4: "Interrupted system call",
    5: "I/O error",
    6: "No such device or address",
    7: "Arg list too long",
    8: "Exec format error",
    9: "Bad file number",
    10: "No children",
    11: "No more processes",
    12: "Not enough core",
    13: "Permission denied",
    14: "Bad address",
    15: "Block device required",
    16: "Mount device busy",
    17: "File exists",
    18: "Cross-device link",
    19: "No such device",
    20: "Not a directory",
    21: "Is a directory",
    22: "Invalid argument",
    23: "Too many open files in system",
    24: "Too many open files",
    25: "Not a typewriter",
    26: "Text file busy",
    27: "File too large",
    28: "No space left on device",
    29: "Illegal seek",
    30: "Read only file system",
    31: "Too many links",
    32: "Broken pipe",
    33: "Math arg out of domain of func",
    34: "Math result not representable",
    35: "File locking deadlock error",
    36: "File or path name too long",
    37: "No record locks available",
    38: "Function not implemented",
    39: "Directory not empty",
    40: "Too many symbolic links",
    42: "No message of desired type",
    43: "Identifier removed",
    44: "Channel number out of range",
    45: "Level 2 not synchronized",
    46: "Level 3 halted",
    47: "Level 3 reset",
    48: "Link number out of range",
    49: "Protocol driver not attached",
    50: "No CSI structure available",
    51: "Level 2 halted",
    52: "Invalid exchange",
    53: "Invalid request descriptor",
    54: "Exchange full",
    55: "No anode",
    56: "Invalid request code",
    57: "Invalid slot",
    59: "Bad font file fmt",
    60: "Device not a stream",
    61: "No data (for no delay io)",
    62: "Timer expired",
    63: "Out of streams resources",
    64: "Machine is not on the network",
    65: "Package not installed",
    66: "The object is remote",
    67: "The link has been severed",
    68: "Advertise error",
    69: "Srmount error",
    70: "Communication error on send",
    71: "Protocol error",
    72: "Multihop attempted",
    73: "Cross mount point (not really error)",
    74: "Trying to read unreadable message",
    75: "Value too large for defined data type",
    76: "Given log. name not unique",
    77: "f.d. invalid for this operation",
    78: "Remote address changed",
    79: "Can   access a needed shared lib",
    80: "Accessing a corrupted shared lib",
    81: ".lib section in a.out corrupted",
    82: "Attempting to link in too many libs",
    83: "Attempting to exec a shared library",
    84: "Illegal byte sequence",
    86: "Streams pipe error",
    87: "Too many users",
    88: "Socket operation on non-socket",
    89: "Destination address required",
    90: "Message too long",
    91: "Protocol wrong type for socket",
    92: "Protocol not available",
    93: "Unknown protocol",
    94: "Socket type not supported",
    95: "Not supported",
    96: "Protocol family not supported",
    97: "Address family not supported by protocol family",
    98: "Address already in use",
    99: "Address not available",
    100: "Network interface is not configured",
    101: "Network is unreachable",
    102: "Connection reset by network",
    103: "Connection aborted",
    104: "Connection reset by peer",
    105: "No buffer space available",
    106: "Socket is already connected",
    107: "Socket is not connected",
    108: "Can't send after socket shutdown",
    109: "Too many references",
    110: "Connection timed out",
    111: "Connection refused",
    112: "Host is down",
    113: "Host is unreachable",
    114: "Socket already connected",
    115: "Connection already in progress",
    116: "Stale file handle",
    122: "Quota exceeded",
    123: "No medium (in tape drive)",
    125: "Operation canceled",
    130: "Previous owner died",
    131: "State not recoverable"
}
  , PATH = {
    splitPath: function(e) {
        return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
    },
    normalizeArray: function(e, r) {
        for (var t = 0, n = e.length - 1; 0 <= n; n--) {
            var o = e[n];
            "." === o ? e.splice(n, 1) : ".." === o ? (e.splice(n, 1),
            t++) : t && (e.splice(n, 1),
            t--)
        }
        if (r)
            for (; t--; t)
                e.unshift("..");
        return e
    },
    normalize: function(e) {
        var r = "/" === e.charAt(0)
          , t = "/" === e.substr(-1);
        return (e = PATH.normalizeArray(e.split("/").filter(function(e) {
            return !!e
        }), !r).join("/")) || r || (e = "."),
        e && t && (e += "/"),
        (r ? "/" : "") + e
    },
    dirname: function(e) {
        var r = PATH.splitPath(e)
          , t = r[0]
          , n = r[1];
        return t || n ? (n && (n = n.substr(0, n.length - 1)),
        t + n) : "."
    },
    basename: function(e) {
        if ("/" === e)
            return "/";
        var r = e.lastIndexOf("/");
        return -1 === r ? e : e.substr(r + 1)
    },
    extname: function(e) {
        return PATH.splitPath(e)[3]
    },
    join: function() {
        var e = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(e.join("/"))
    },
    join2: function(e, r) {
        return PATH.normalize(e + "/" + r)
    },
    resolve: function() {
        for (var e = "", r = !1, t = arguments.length - 1; -1 <= t && !r; t--) {
            var n = 0 <= t ? arguments[t] : FS.cwd();
            if ("string" != typeof n)
                throw new TypeError("Arguments to path.resolve must be strings");
            if (!n)
                return "";
            e = n + "/" + e,
            r = "/" === n.charAt(0)
        }
        return (r ? "/" : "") + (e = PATH.normalizeArray(e.split("/").filter(function(e) {
            return !!e
        }), !r).join("/")) || "."
    },
    relative: function(e, r) {
        function t(e) {
            for (var r = 0; r < e.length && "" === e[r]; r++)
                ;
            for (var t = e.length - 1; 0 <= t && "" === e[t]; t--)
                ;
            return t < r ? [] : e.slice(r, t - r + 1)
        }
        e = PATH.resolve(e).substr(1),
        r = PATH.resolve(r).substr(1);
        for (var n = t(e.split("/")), o = t(r.split("/")), i = Math.min(n.length, o.length), a = i, s = 0; s < i; s++)
            if (n[s] !== o[s]) {
                a = s;
                break
            }
        var u = [];
        for (s = a; s < n.length; s++)
            u.push("..");
        return (u = u.concat(o.slice(a))).join("/")
    }
}
  , TTY = {
    ttys: [],
    init: function() {},
    shutdown: function() {},
    register: function(e, r) {
        TTY.ttys[e] = {
            input: [],
            output: [],
            ops: r
        },
        FS.registerDevice(e, TTY.stream_ops)
    },
    stream_ops: {
        open: function(e) {
            var r = TTY.ttys[e.node.rdev];
            if (!r)
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            e.tty = r,
            e.seekable = !1
        },
        close: function(e) {
            e.tty.ops.flush(e.tty)
        },
        flush: function(e) {
            e.tty.ops.flush(e.tty)
        },
        read: function(e, r, t, n, o) {
            if (!e.tty || !e.tty.ops.get_char)
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            for (var i = 0, a = 0; a < n; a++) {
                var s;
                try {
                    s = e.tty.ops.get_char(e.tty)
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO)
                }
                if (void 0 === s && 0 === i)
                    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                if (null == s)
                    break;
                i++,
                r[t + a] = s
            }
            return i && (e.node.timestamp = Date.now()),
            i
        },
        write: function(e, r, t, n, o) {
            if (!e.tty || !e.tty.ops.put_char)
                throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
            for (var i = 0; i < n; i++)
                try {
                    e.tty.ops.put_char(e.tty, r[t + i])
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES.EIO)
                }
            return n && (e.node.timestamp = Date.now()),
            i
        }
    },
    default_tty_ops: {
        get_char: function(e) {
            if (!e.input.length) {
                var r = null;
                if (ENVIRONMENT_IS_NODE) {
                    var t, n = new Buffer(256), o = process.stdin.fd, i = !1;
                    try {
                        o = fs.openSync("/dev/stdin", "r"),
                        i = !0
                    } catch (e) {}
                    t = fs.readSync(o, n, 0, 256, null),
                    i && fs.closeSync(o),
                    r = 0 < t ? n.slice(0, t).toString("utf-8") : null
                } else
                    "undefined" != typeof window && "function" == typeof window.prompt ? null !== (r = window.prompt("Input: ")) && (r += "\n") : "function" == typeof readline && null !== (r = readline()) && (r += "\n");
                if (!r)
                    return null;
                e.input = intArrayFromString(r, !0)
            }
            return e.input.shift()
        },
        put_char: function(e, r) {
            null === r || 10 === r ? (Module.print(UTF8ArrayToString(e.output, 0)),
            e.output = []) : 0 != r && e.output.push(r)
        },
        flush: function(e) {
            e.output && 0 < e.output.length && (Module.print(UTF8ArrayToString(e.output, 0)),
            e.output = [])
        }
    },
    default_tty1_ops: {
        put_char: function(e, r) {
            null === r || 10 === r ? (Module.printErr(UTF8ArrayToString(e.output, 0)),
            e.output = []) : 0 != r && e.output.push(r)
        },
        flush: function(e) {
            e.output && 0 < e.output.length && (Module.printErr(UTF8ArrayToString(e.output, 0)),
            e.output = [])
        }
    }
}
  , MEMFS = {
    ops_table: null,
    mount: function(e) {
        return MEMFS.createNode(null, "/", 16895, 0)
    },
    createNode: function(e, r, t, n) {
        if (FS.isBlkdev(t) || FS.isFIFO(t))
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        MEMFS.ops_table || (MEMFS.ops_table = {
            dir: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr,
                    lookup: MEMFS.node_ops.lookup,
                    mknod: MEMFS.node_ops.mknod,
                    rename: MEMFS.node_ops.rename,
                    unlink: MEMFS.node_ops.unlink,
                    rmdir: MEMFS.node_ops.rmdir,
                    readdir: MEMFS.node_ops.readdir,
                    symlink: MEMFS.node_ops.symlink
                },
                stream: {
                    llseek: MEMFS.stream_ops.llseek
                }
            },
            file: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr
                },
                stream: {
                    llseek: MEMFS.stream_ops.llseek,
                    read: MEMFS.stream_ops.read,
                    write: MEMFS.stream_ops.write,
                    allocate: MEMFS.stream_ops.allocate,
                    mmap: MEMFS.stream_ops.mmap,
                    msync: MEMFS.stream_ops.msync
                }
            },
            link: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr,
                    readlink: MEMFS.node_ops.readlink
                },
                stream: {}
            },
            chrdev: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr
                },
                stream: FS.chrdev_stream_ops
            }
        });
        var o = FS.createNode(e, r, t, n);
        return FS.isDir(o.mode) ? (o.node_ops = MEMFS.ops_table.dir.node,
        o.stream_ops = MEMFS.ops_table.dir.stream,
        o.contents = {}) : FS.isFile(o.mode) ? (o.node_ops = MEMFS.ops_table.file.node,
        o.stream_ops = MEMFS.ops_table.file.stream,
        o.usedBytes = 0,
        o.contents = null) : FS.isLink(o.mode) ? (o.node_ops = MEMFS.ops_table.link.node,
        o.stream_ops = MEMFS.ops_table.link.stream) : FS.isChrdev(o.mode) && (o.node_ops = MEMFS.ops_table.chrdev.node,
        o.stream_ops = MEMFS.ops_table.chrdev.stream),
        o.timestamp = Date.now(),
        e && (e.contents[r] = o),
        o
    },
    getFileDataAsRegularArray: function(e) {
        if (e.contents && e.contents.subarray) {
            for (var r = [], t = 0; t < e.usedBytes; ++t)
                r.push(e.contents[t]);
            return r
        }
        return e.contents
    },
    getFileDataAsTypedArray: function(e) {
        return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array
    },
    expandFileStorage: function(e, r) {
        if (e.contents && e.contents.subarray && r > e.contents.length && (e.contents = MEMFS.getFileDataAsRegularArray(e),
        e.usedBytes = e.contents.length),
        !e.contents || e.contents.subarray) {
            var t = e.contents ? e.contents.buffer.byteLength : 0;
            if (r <= t)
                return;
            r = Math.max(r, t * (t < 1048576 ? 2 : 1.125) | 0),
            0 != t && (r = Math.max(r, 256));
            var n = e.contents;
            return e.contents = new Uint8Array(r),
            void (0 < e.usedBytes && e.contents.set(n.subarray(0, e.usedBytes), 0))
        }
        for (!e.contents && 0 < r && (e.contents = []); e.contents.length < r; )
            e.contents.push(0)
    },
    resizeFileStorage: function(e, r) {
        if (e.usedBytes != r) {
            if (0 == r)
                return e.contents = null,
                void (e.usedBytes = 0);
            if (!e.contents || e.contents.subarray) {
                var t = e.contents;
                return e.contents = new Uint8Array(new ArrayBuffer(r)),
                t && e.contents.set(t.subarray(0, Math.min(r, e.usedBytes))),
                void (e.usedBytes = r)
            }
            if (e.contents || (e.contents = []),
            e.contents.length > r)
                e.contents.length = r;
            else
                for (; e.contents.length < r; )
                    e.contents.push(0);
            e.usedBytes = r
        }
    },
    node_ops: {
        getattr: function(e) {
            var r = {};
            return r.dev = FS.isChrdev(e.mode) ? e.id : 1,
            r.ino = e.id,
            r.mode = e.mode,
            r.nlink = 1,
            r.uid = 0,
            r.gid = 0,
            r.rdev = e.rdev,
            FS.isDir(e.mode) ? r.size = 4096 : FS.isFile(e.mode) ? r.size = e.usedBytes : FS.isLink(e.mode) ? r.size = e.link.length : r.size = 0,
            r.atime = new Date(e.timestamp),
            r.mtime = new Date(e.timestamp),
            r.ctime = new Date(e.timestamp),
            r.blksize = 4096,
            r.blocks = Math.ceil(r.size / r.blksize),
            r
        },
        setattr: function(e, r) {
            void 0 !== r.mode && (e.mode = r.mode),
            void 0 !== r.timestamp && (e.timestamp = r.timestamp),
            void 0 !== r.size && MEMFS.resizeFileStorage(e, r.size)
        },
        lookup: function(e, r) {
            throw FS.genericErrors[ERRNO_CODES.ENOENT]
        },
        mknod: function(e, r, t, n) {
            return MEMFS.createNode(e, r, t, n)
        },
        rename: function(e, r, t) {
            if (FS.isDir(e.mode)) {
                var n;
                try {
                    n = FS.lookupNode(r, t)
                } catch (e) {}
                if (n)
                    for (var o in n.contents)
                        throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
            }
            delete e.parent.contents[e.name],
            e.name = t,
            (r.contents[t] = e).parent = r
        },
        unlink: function(e, r) {
            delete e.contents[r]
        },
        rmdir: function(e, r) {
            var t = FS.lookupNode(e, r);
            for (var n in t.contents)
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
            delete e.contents[r]
        },
        readdir: function(e) {
            var r = [".", ".."];
            for (var t in e.contents)
                e.contents.hasOwnProperty(t) && r.push(t);
            return r
        },
        symlink: function(e, r, t) {
            var n = MEMFS.createNode(e, r, 41471, 0);
            return n.link = t,
            n
        },
        readlink: function(e) {
            if (!FS.isLink(e.mode))
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return e.link
        }
    },
    stream_ops: {
        read: function(e, r, t, n, o) {
            var i = e.node.contents;
            if (o >= e.node.usedBytes)
                return 0;
            var a = Math.min(e.node.usedBytes - o, n);
            if (assert(0 <= a),
            8 < a && i.subarray)
                r.set(i.subarray(o, o + a), t);
            else
                for (var s = 0; s < a; s++)
                    r[t + s] = i[o + s];
            return a
        },
        write: function(e, r, t, n, o, i) {
            if (!n)
                return 0;
            var a = e.node;
            if (a.timestamp = Date.now(),
            r.subarray && (!a.contents || a.contents.subarray)) {
                if (i)
                    return assert(0 === o, "canOwn must imply no weird position inside the file"),
                    a.contents = r.subarray(t, t + n),
                    a.usedBytes = n;
                if (0 === a.usedBytes && 0 === o)
                    return a.contents = new Uint8Array(r.subarray(t, t + n)),
                    a.usedBytes = n;
                if (o + n <= a.usedBytes)
                    return a.contents.set(r.subarray(t, t + n), o),
                    n
            }
            if (MEMFS.expandFileStorage(a, o + n),
            a.contents.subarray && r.subarray)
                a.contents.set(r.subarray(t, t + n), o);
            else
                for (var s = 0; s < n; s++)
                    a.contents[o + s] = r[t + s];
            return a.usedBytes = Math.max(a.usedBytes, o + n),
            n
        },
        llseek: function(e, r, t) {
            var n = r;
            if (1 === t ? n += e.position : 2 === t && FS.isFile(e.node.mode) && (n += e.node.usedBytes),
            n < 0)
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return n
        },
        allocate: function(e, r, t) {
            MEMFS.expandFileStorage(e.node, r + t),
            e.node.usedBytes = Math.max(e.node.usedBytes, r + t)
        },
        mmap: function(e, r, t, n, o, i, a) {
            if (!FS.isFile(e.node.mode))
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            var s, u, l = e.node.contents;
            if (2 & a || l.buffer !== r && l.buffer !== r.buffer) {
                if ((0 < o || o + n < e.node.usedBytes) && (l = l.subarray ? l.subarray(o, o + n) : Array.prototype.slice.call(l, o, o + n)),
                u = !0,
                !(s = _malloc(n)))
                    throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
                r.set(l, s)
            } else
                u = !1,
                s = l.byteOffset;
            return {
                ptr: s,
                allocated: u
            }
        },
        msync: function(e, r, t, n, o) {
            if (!FS.isFile(e.node.mode))
                throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
            if (2 & o)
                return 0;
            MEMFS.stream_ops.write(e, r, 0, n, t, !1);
            return 0
        }
    }
}
  , IDBFS = {
    dbs: {},
    indexedDB: function() {
        if ("undefined" != typeof indexedDB)
            return indexedDB;
        var e = null;
        return "object" == typeof window && (e = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB),
        assert(e, "IDBFS used, but indexedDB not supported"),
        e
    },
    DB_VERSION: 21,
    DB_STORE_NAME: "FILE_DATA",
    mount: function(e) {
        return MEMFS.mount.apply(null, arguments)
    },
    syncfs: function(r, i, a) {
        IDBFS.getLocalSet(r, function(e, o) {
            if (e)
                return a(e);
            IDBFS.getRemoteSet(r, function(e, r) {
                if (e)
                    return a(e);
                var t = i ? r : o
                  , n = i ? o : r;
                IDBFS.reconcile(t, n, a)
            })
        })
    },
    getDB: function(e, r) {
        var t, n = IDBFS.dbs[e];
        if (n)
            return r(null, n);
        try {
            t = IDBFS.indexedDB().open(e, IDBFS.DB_VERSION)
        } catch (e) {
            return r(e)
        }
        t.onupgradeneeded = function(e) {
            var r, t = e.target.result, n = e.target.transaction;
            (r = t.objectStoreNames.contains(IDBFS.DB_STORE_NAME) ? n.objectStore(IDBFS.DB_STORE_NAME) : t.createObjectStore(IDBFS.DB_STORE_NAME)).indexNames.contains("timestamp") || r.createIndex("timestamp", "timestamp", {
                unique: !1
            })
        }
        ,
        t.onsuccess = function() {
            n = t.result,
            IDBFS.dbs[e] = n,
            r(null, n)
        }
        ,
        t.onerror = function(e) {
            r(this.error),
            e.preventDefault()
        }
    },
    getLocalSet: function(e, r) {
        var t = {};
        function n(e) {
            return "." !== e && ".." !== e
        }
        function o(r) {
            return function(e) {
                return PATH.join2(r, e)
            }
        }
        for (var i = FS.readdir(e.mountpoint).filter(n).map(o(e.mountpoint)); i.length; ) {
            var a, s = i.pop();
            try {
                a = FS.stat(s)
            } catch (e) {
                return r(e)
            }
            FS.isDir(a.mode) && i.push.apply(i, FS.readdir(s).filter(n).map(o(s))),
            t[s] = {
                timestamp: a.mtime
            }
        }
        return r(null, {
            type: "local",
            entries: t
        })
    },
    getRemoteSet: function(e, n) {
        var o = {};
        IDBFS.getDB(e.mountpoint, function(e, t) {
            if (e)
                return n(e);
            var r = t.transaction([IDBFS.DB_STORE_NAME], "readonly");
            r.onerror = function(e) {
                n(this.error),
                e.preventDefault()
            }
            ,
            r.objectStore(IDBFS.DB_STORE_NAME).index("timestamp").openKeyCursor().onsuccess = function(e) {
                var r = e.target.result;
                if (!r)
                    return n(null, {
                        type: "remote",
                        db: t,
                        entries: o
                    });
                o[r.primaryKey] = {
                    timestamp: r.key
                },
                r.continue()
            }
        })
    },
    loadLocalEntry: function(e, r) {
        var t, n;
        try {
            n = FS.lookupPath(e).node,
            t = FS.stat(e)
        } catch (e) {
            return r(e)
        }
        return FS.isDir(t.mode) ? r(null, {
            timestamp: t.mtime,
            mode: t.mode
        }) : FS.isFile(t.mode) ? (n.contents = MEMFS.getFileDataAsTypedArray(n),
        r(null, {
            timestamp: t.mtime,
            mode: t.mode,
            contents: n.contents
        })) : r(new Error("node type not supported"))
    },
    storeLocalEntry: function(e, r, t) {
        try {
            if (FS.isDir(r.mode))
                FS.mkdir(e, r.mode);
            else {
                if (!FS.isFile(r.mode))
                    return t(new Error("node type not supported"));
                FS.writeFile(e, r.contents, {
                    encoding: "binary",
                    canOwn: !0
                })
            }
            FS.chmod(e, r.mode),
            FS.utime(e, r.timestamp, r.timestamp)
        } catch (e) {
            return t(e)
        }
        t(null)
    },
    removeLocalEntry: function(e, r) {
        try {
            FS.lookupPath(e);
            var t = FS.stat(e);
            FS.isDir(t.mode) ? FS.rmdir(e) : FS.isFile(t.mode) && FS.unlink(e)
        } catch (e) {
            return r(e)
        }
        r(null)
    },
    loadRemoteEntry: function(e, r, t) {
        var n = e.get(r);
        n.onsuccess = function(e) {
            t(null, e.target.result)
        }
        ,
        n.onerror = function(e) {
            t(this.error),
            e.preventDefault()
        }
    },
    storeRemoteEntry: function(e, r, t, n) {
        var o = e.put(t, r);
        o.onsuccess = function() {
            n(null)
        }
        ,
        o.onerror = function(e) {
            n(this.error),
            e.preventDefault()
        }
    },
    removeRemoteEntry: function(e, r, t) {
        var n = e.delete(r);
        n.onsuccess = function() {
            t(null)
        }
        ,
        n.onerror = function(e) {
            t(this.error),
            e.preventDefault()
        }
    },
    reconcile: function(n, o, r) {
        var i = 0
          , a = [];
        Object.keys(n.entries).forEach(function(e) {
            var r = n.entries[e]
              , t = o.entries[e];
            (!t || r.timestamp > t.timestamp) && (a.push(e),
            i++)
        });
        var t = [];
        if (Object.keys(o.entries).forEach(function(e) {
            o.entries[e];
            n.entries[e] || (t.push(e),
            i++)
        }),
        !i)
            return r(null);
        var s = 0
          , e = ("remote" === n.type ? n.db : o.db).transaction([IDBFS.DB_STORE_NAME], "readwrite")
          , u = e.objectStore(IDBFS.DB_STORE_NAME);
        function l(e) {
            return e ? l.errored ? void 0 : (l.errored = !0,
            r(e)) : ++s >= i ? r(null) : void 0
        }
        e.onerror = function(e) {
            l(this.error),
            e.preventDefault()
        }
        ,
        a.sort().forEach(function(t) {
            "local" === o.type ? IDBFS.loadRemoteEntry(u, t, function(e, r) {
                if (e)
                    return l(e);
                IDBFS.storeLocalEntry(t, r, l)
            }) : IDBFS.loadLocalEntry(t, function(e, r) {
                if (e)
                    return l(e);
                IDBFS.storeRemoteEntry(u, t, r, l)
            })
        }),
        t.sort().reverse().forEach(function(e) {
            "local" === o.type ? IDBFS.removeLocalEntry(e, l) : IDBFS.removeRemoteEntry(u, e, l)
        })
    }
}
  , NODEFS = {
    isWindows: !1,
    staticInit: function() {
        NODEFS.isWindows = !!process.platform.match(/^win/)
    },
    mount: function(e) {
        return assert(ENVIRONMENT_IS_NODE),
        NODEFS.createNode(null, "/", NODEFS.getMode(e.opts.root), 0)
    },
    createNode: function(e, r, t, n) {
        if (!FS.isDir(t) && !FS.isFile(t) && !FS.isLink(t))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var o = FS.createNode(e, r, t);
        return o.node_ops = NODEFS.node_ops,
        o.stream_ops = NODEFS.stream_ops,
        o
    },
    getMode: function(e) {
        var r;
        try {
            r = fs.lstatSync(e),
            NODEFS.isWindows && (r.mode = r.mode | (146 & r.mode) >> 1)
        } catch (e) {
            if (!e.code)
                throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return r.mode
    },
    realPath: function(e) {
        for (var r = []; e.parent !== e; )
            r.push(e.name),
            e = e.parent;
        return r.push(e.mount.opts.root),
        r.reverse(),
        PATH.join.apply(null, r)
    },
    flagsToPermissionStringMap: {
        0: "r",
        1: "r+",
        2: "r+",
        64: "r",
        65: "r+",
        66: "r+",
        129: "rx+",
        193: "rx+",
        514: "w+",
        577: "w",
        578: "w+",
        705: "wx",
        706: "wx+",
        1024: "a",
        1025: "a",
        1026: "a+",
        1089: "a",
        1090: "a+",
        1153: "ax",
        1154: "ax+",
        1217: "ax",
        1218: "ax+",
        4096: "rs",
        4098: "rs+"
    },
    flagsToPermissionString: function(e) {
        if ((e &= -32769)in NODEFS.flagsToPermissionStringMap)
            return NODEFS.flagsToPermissionStringMap[e];
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
    },
    node_ops: {
        getattr: function(e) {
            var r, t = NODEFS.realPath(e);
            try {
                r = fs.lstatSync(t)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return NODEFS.isWindows && !r.blksize && (r.blksize = 4096),
            NODEFS.isWindows && !r.blocks && (r.blocks = (r.size + r.blksize - 1) / r.blksize | 0),
            {
                dev: r.dev,
                ino: r.ino,
                mode: r.mode,
                nlink: r.nlink,
                uid: r.uid,
                gid: r.gid,
                rdev: r.rdev,
                size: r.size,
                atime: r.atime,
                mtime: r.mtime,
                ctime: r.ctime,
                blksize: r.blksize,
                blocks: r.blocks
            }
        },
        setattr: function(e, r) {
            var t = NODEFS.realPath(e);
            try {
                if (void 0 !== r.mode && (fs.chmodSync(t, r.mode),
                e.mode = r.mode),
                void 0 !== r.timestamp) {
                    var n = new Date(r.timestamp);
                    fs.utimesSync(t, n, n)
                }
                void 0 !== r.size && fs.truncateSync(t, r.size)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        lookup: function(e, r) {
            var t = PATH.join2(NODEFS.realPath(e), r)
              , n = NODEFS.getMode(t);
            return NODEFS.createNode(e, r, n)
        },
        mknod: function(e, r, t, n) {
            var o = NODEFS.createNode(e, r, t, n)
              , i = NODEFS.realPath(o);
            try {
                FS.isDir(o.mode) ? fs.mkdirSync(i, o.mode) : fs.writeFileSync(i, "", {
                    mode: o.mode
                })
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return o
        },
        rename: function(e, r, t) {
            var n = NODEFS.realPath(e)
              , o = PATH.join2(NODEFS.realPath(r), t);
            try {
                fs.renameSync(n, o)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        unlink: function(e, r) {
            var t = PATH.join2(NODEFS.realPath(e), r);
            try {
                fs.unlinkSync(t)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        rmdir: function(e, r) {
            var t = PATH.join2(NODEFS.realPath(e), r);
            try {
                fs.rmdirSync(t)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        readdir: function(e) {
            var r = NODEFS.realPath(e);
            try {
                return fs.readdirSync(r)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        symlink: function(e, r, t) {
            var n = PATH.join2(NODEFS.realPath(e), r);
            try {
                fs.symlinkSync(t, n)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        readlink: function(e) {
            var r = NODEFS.realPath(e);
            try {
                return r = fs.readlinkSync(r),
                r = NODEJS_PATH.relative(NODEJS_PATH.resolve(e.mount.opts.root), r)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        }
    },
    stream_ops: {
        open: function(e) {
            var r = NODEFS.realPath(e.node);
            try {
                FS.isFile(e.node.mode) && (e.nfd = fs.openSync(r, NODEFS.flagsToPermissionString(e.flags)))
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        close: function(e) {
            try {
                FS.isFile(e.node.mode) && e.nfd && fs.closeSync(e.nfd)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
        },
        read: function(e, r, t, n, o) {
            if (0 === n)
                return 0;
            var i, a = new Buffer(n);
            try {
                i = fs.readSync(e.nfd, a, 0, n, o)
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            if (0 < i)
                for (var s = 0; s < i; s++)
                    r[t + s] = a[s];
            return i
        },
        write: function(e, r, t, n, o) {
            var i, a = new Buffer(r.subarray(t, t + n));
            try {
                i = fs.writeSync(e.nfd, a, 0, n, o)
            } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code])
            }
            return i
        },
        llseek: function(e, r, t) {
            var n = r;
            if (1 === t)
                n += e.position;
            else if (2 === t && FS.isFile(e.node.mode))
                try {
                    n += fs.fstatSync(e.nfd).size
                } catch (e) {
                    throw new FS.ErrnoError(ERRNO_CODES[e.code])
                }
            if (n < 0)
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return n
        }
    }
}
  , WORKERFS = {
    DIR_MODE: 16895,
    FILE_MODE: 33279,
    reader: null,
    mount: function(e) {
        assert(ENVIRONMENT_IS_WORKER),
        WORKERFS.reader || (WORKERFS.reader = new FileReaderSync);
        var i = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0)
          , a = {};
        function n(e) {
            for (var r = e.split("/"), t = i, n = 0; n < r.length - 1; n++) {
                var o = r.slice(0, n + 1).join("/");
                a[o] || (a[o] = WORKERFS.createNode(t, o, WORKERFS.DIR_MODE, 0)),
                t = a[o]
            }
            return t
        }
        function o(e) {
            var r = e.split("/");
            return r[r.length - 1]
        }
        return Array.prototype.forEach.call(e.opts.files || [], function(e) {
            WORKERFS.createNode(n(e.name), o(e.name), WORKERFS.FILE_MODE, 0, e, e.lastModifiedDate)
        }),
        (e.opts.blobs || []).forEach(function(e) {
            WORKERFS.createNode(n(e.name), o(e.name), WORKERFS.FILE_MODE, 0, e.data)
        }),
        (e.opts.packages || []).forEach(function(t) {
            t.metadata.files.forEach(function(e) {
                var r = e.filename.substr(1);
                WORKERFS.createNode(n(r), o(r), WORKERFS.FILE_MODE, 0, t.blob.slice(e.start, e.end))
            })
        }),
        i
    },
    createNode: function(e, r, t, n, o, i) {
        var a = FS.createNode(e, r, t);
        return a.mode = t,
        a.node_ops = WORKERFS.node_ops,
        a.stream_ops = WORKERFS.stream_ops,
        a.timestamp = (i || new Date).getTime(),
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE),
        t === WORKERFS.FILE_MODE ? (a.size = o.size,
        a.contents = o) : (a.size = 4096,
        a.contents = {}),
        e && (e.contents[r] = a),
        a
    },
    node_ops: {
        getattr: function(e) {
            return {
                dev: 1,
                ino: void 0,
                mode: e.mode,
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: void 0,
                size: e.size,
                atime: new Date(e.timestamp),
                mtime: new Date(e.timestamp),
                ctime: new Date(e.timestamp),
                blksize: 4096,
                blocks: Math.ceil(e.size / 4096)
            }
        },
        setattr: function(e, r) {
            void 0 !== r.mode && (e.mode = r.mode),
            void 0 !== r.timestamp && (e.timestamp = r.timestamp)
        },
        lookup: function(e, r) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
        },
        mknod: function(e, r, t, n) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        rename: function(e, r, t) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        unlink: function(e, r) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        rmdir: function(e, r) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        readdir: function(e) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        symlink: function(e, r, t) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        },
        readlink: function(e) {
            throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        }
    },
    stream_ops: {
        read: function(e, r, t, n, o) {
            if (o >= e.node.size)
                return 0;
            var i = e.node.contents.slice(o, o + n)
              , a = WORKERFS.reader.readAsArrayBuffer(i);
            return r.set(new Uint8Array(a), t),
            i.size
        },
        write: function(e, r, t, n, o) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
        },
        llseek: function(e, r, t) {
            var n = r;
            if (1 === t ? n += e.position : 2 === t && FS.isFile(e.node.mode) && (n += e.node.size),
            n < 0)
                throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
            return n
        }
    }
}
  , _stdin = allocate(1, "i32*", ALLOC_STATIC)
  , _stdout = allocate(1, "i32*", ALLOC_STATIC)
  , _stderr = allocate(1, "i32*", ALLOC_STATIC)
  , FS = {
    root: null,
    mounts: [],
    devices: [null],
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: !1,
    ignorePermissions: !0,
    trackingDelegate: {},
    tracking: {
        openFlags: {
            READ: 1,
            WRITE: 2
        }
    },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    handleFSError: function(e) {
        if (!(e instanceof FS.ErrnoError))
            throw e + " : " + stackTrace();
        return ___setErrNo(e.errno)
    },
    lookupPath: function(e, r) {
        if (r = r || {},
        !(e = PATH.resolve(FS.cwd(), e)))
            return {
                path: "",
                node: null
            };
        var t = {
            follow_mount: !0,
            recurse_count: 0
        };
        for (var n in t)
            void 0 === r[n] && (r[n] = t[n]);
        if (8 < r.recurse_count)
            throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        for (var o = PATH.normalizeArray(e.split("/").filter(function(e) {
            return !!e
        }), !1), i = FS.root, a = "/", s = 0; s < o.length; s++) {
            var u = s === o.length - 1;
            if (u && r.parent)
                break;
            if (i = FS.lookupNode(i, o[s]),
            a = PATH.join2(a, o[s]),
            FS.isMountpoint(i) && (!u || u && r.follow_mount) && (i = i.mounted.root),
            !u || r.follow)
                for (var l = 0; FS.isLink(i.mode); ) {
                    var c = FS.readlink(a);
                    if (a = PATH.resolve(PATH.dirname(a), c),
                    i = FS.lookupPath(a, {
                        recurse_count: r.recurse_count
                    }).node,
                    40 < l++)
                        throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
                }
        }
        return {
            path: a,
            node: i
        }
    },
    getPath: function(e) {
        for (var r; ; ) {
            if (FS.isRoot(e)) {
                var t = e.mount.mountpoint;
                return r ? "/" !== t[t.length - 1] ? t + "/" + r : t + r : t
            }
            r = r ? e.name + "/" + r : e.name,
            e = e.parent
        }
    },
    hashName: function(e, r) {
        for (var t = 0, n = 0; n < r.length; n++)
            t = (t << 5) - t + r.charCodeAt(n) | 0;
        return (e + t >>> 0) % FS.nameTable.length
    },
    hashAddNode: function(e) {
        var r = FS.hashName(e.parent.id, e.name);
        e.name_next = FS.nameTable[r],
        FS.nameTable[r] = e
    },
    hashRemoveNode: function(e) {
        var r = FS.hashName(e.parent.id, e.name);
        if (FS.nameTable[r] === e)
            FS.nameTable[r] = e.name_next;
        else
            for (var t = FS.nameTable[r]; t; ) {
                if (t.name_next === e) {
                    t.name_next = e.name_next;
                    break
                }
                t = t.name_next
            }
    },
    lookupNode: function(e, r) {
        var t = FS.mayLookup(e);
        if (t)
            throw new FS.ErrnoError(t,e);
        for (var n = FS.hashName(e.id, r), o = FS.nameTable[n]; o; o = o.name_next) {
            var i = o.name;
            if (o.parent.id === e.id && i === r)
                return o
        }
        return FS.lookup(e, r)
    },
    createNode: function(e, r, t, n) {
        if (!FS.FSNode) {
            FS.FSNode = function(e, r, t, n) {
                e || (e = this),
                this.parent = e,
                this.mount = e.mount,
                this.mounted = null,
                this.id = FS.nextInode++,
                this.name = r,
                this.mode = t,
                this.node_ops = {},
                this.stream_ops = {},
                this.rdev = n
            }
            ,
            FS.FSNode.prototype = {};
            Object.defineProperties(FS.FSNode.prototype, {
                read: {
                    get: function() {
                        return 365 == (365 & this.mode)
                    },
                    set: function(e) {
                        e ? this.mode |= 365 : this.mode &= -366
                    }
                },
                write: {
                    get: function() {
                        return 146 == (146 & this.mode)
                    },
                    set: function(e) {
                        e ? this.mode |= 146 : this.mode &= -147
                    }
                },
                isFolder: {
                    get: function() {
                        return FS.isDir(this.mode)
                    }
                },
                isDevice: {
                    get: function() {
                        return FS.isChrdev(this.mode)
                    }
                }
            })
        }
        var o = new FS.FSNode(e,r,t,n);
        return FS.hashAddNode(o),
        o
    },
    destroyNode: function(e) {
        FS.hashRemoveNode(e)
    },
    isRoot: function(e) {
        return e === e.parent
    },
    isMountpoint: function(e) {
        return !!e.mounted
    },
    isFile: function(e) {
        return 32768 == (61440 & e)
    },
    isDir: function(e) {
        return 16384 == (61440 & e)
    },
    isLink: function(e) {
        return 40960 == (61440 & e)
    },
    isChrdev: function(e) {
        return 8192 == (61440 & e)
    },
    isBlkdev: function(e) {
        return 24576 == (61440 & e)
    },
    isFIFO: function(e) {
        return 4096 == (61440 & e)
    },
    isSocket: function(e) {
        return 49152 == (49152 & e)
    },
    flagModes: {
        r: 0,
        rs: 1052672,
        "r+": 2,
        w: 577,
        wx: 705,
        xw: 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        a: 1089,
        ax: 1217,
        xa: 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
    },
    modeStringToFlags: function(e) {
        var r = FS.flagModes[e];
        if (void 0 === r)
            throw new Error("Unknown file open mode: " + e);
        return r
    },
    flagsToPermissionString: function(e) {
        var r = ["r", "w", "rw"][3 & e];
        return 512 & e && (r += "w"),
        r
    },
    nodePermissions: function(e, r) {
        return FS.ignorePermissions ? 0 : (-1 === r.indexOf("r") || 292 & e.mode) && (-1 === r.indexOf("w") || 146 & e.mode) && (-1 === r.indexOf("x") || 73 & e.mode) ? 0 : ERRNO_CODES.EACCES
    },
    mayLookup: function(e) {
        var r = FS.nodePermissions(e, "x");
        return r || (e.node_ops.lookup ? 0 : ERRNO_CODES.EACCES)
    },
    mayCreate: function(e, r) {
        try {
            FS.lookupNode(e, r);
            return ERRNO_CODES.EEXIST
        } catch (e) {}
        return FS.nodePermissions(e, "wx")
    },
    mayDelete: function(e, r, t) {
        var n;
        try {
            n = FS.lookupNode(e, r)
        } catch (e) {
            return e.errno
        }
        var o = FS.nodePermissions(e, "wx");
        if (o)
            return o;
        if (t) {
            if (!FS.isDir(n.mode))
                return ERRNO_CODES.ENOTDIR;
            if (FS.isRoot(n) || FS.getPath(n) === FS.cwd())
                return ERRNO_CODES.EBUSY
        } else if (FS.isDir(n.mode))
            return ERRNO_CODES.EISDIR;
        return 0
    },
    mayOpen: function(e, r) {
        return e ? FS.isLink(e.mode) ? ERRNO_CODES.ELOOP : FS.isDir(e.mode) && (0 != (2097155 & r) || 512 & r) ? ERRNO_CODES.EISDIR : FS.nodePermissions(e, FS.flagsToPermissionString(r)) : ERRNO_CODES.ENOENT
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function(e, r) {
        e = e || 0,
        r = r || FS.MAX_OPEN_FDS;
        for (var t = e; t <= r; t++)
            if (!FS.streams[t])
                return t;
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE)
    },
    getStream: function(e) {
        return FS.streams[e]
    },
    createStream: function(e, r, t) {
        FS.FSStream || (FS.FSStream = function() {}
        ,
        FS.FSStream.prototype = {},
        Object.defineProperties(FS.FSStream.prototype, {
            object: {
                get: function() {
                    return this.node
                },
                set: function(e) {
                    this.node = e
                }
            },
            isRead: {
                get: function() {
                    return 1 != (2097155 & this.flags)
                }
            },
            isWrite: {
                get: function() {
                    return 0 != (2097155 & this.flags)
                }
            },
            isAppend: {
                get: function() {
                    return 1024 & this.flags
                }
            }
        }));
        var n = new FS.FSStream;
        for (var o in e)
            n[o] = e[o];
        e = n;
        var i = FS.nextfd(r, t);
        return e.fd = i,
        FS.streams[i] = e
    },
    closeStream: function(e) {
        FS.streams[e] = null
    },
    chrdev_stream_ops: {
        open: function(e) {
            var r = FS.getDevice(e.node.rdev);
            e.stream_ops = r.stream_ops,
            e.stream_ops.open && e.stream_ops.open(e)
        },
        llseek: function() {
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
        }
    },
    major: function(e) {
        return e >> 8
    },
    minor: function(e) {
        return 255 & e
    },
    makedev: function(e, r) {
        return e << 8 | r
    },
    registerDevice: function(e, r) {
        FS.devices[e] = {
            stream_ops: r
        }
    },
    getDevice: function(e) {
        return FS.devices[e]
    },
    getMounts: function(e) {
        for (var r = [], t = [e]; t.length; ) {
            var n = t.pop();
            r.push(n),
            t.push.apply(t, n.mounts)
        }
        return r
    },
    syncfs: function(r, t) {
        "function" == typeof r && (t = r,
        r = !1);
        var n = FS.getMounts(FS.root.mount)
          , o = 0;
        function i(e) {
            if (e)
                return i.errored ? void 0 : (i.errored = !0,
                t(e));
            ++o >= n.length && t(null)
        }
        n.forEach(function(e) {
            if (!e.type.syncfs)
                return i(null);
            e.type.syncfs(e, r, i)
        })
    },
    mount: function(e, r, t) {
        var n, o = "/" === t, i = !t;
        if (o && FS.root)
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        if (!o && !i) {
            var a = FS.lookupPath(t, {
                follow_mount: !1
            });
            if (t = a.path,
            n = a.node,
            FS.isMountpoint(n))
                throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            if (!FS.isDir(n.mode))
                throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
        }
        var s = {
            type: e,
            opts: r,
            mountpoint: t,
            mounts: []
        }
          , u = e.mount(s);
        return (u.mount = s).root = u,
        o ? FS.root = u : n && (n.mounted = s,
        n.mount && n.mount.mounts.push(s)),
        u
    },
    unmount: function(e) {
        var r = FS.lookupPath(e, {
            follow_mount: !1
        });
        if (!FS.isMountpoint(r.node))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var t = r.node
          , n = t.mounted
          , o = FS.getMounts(n);
        Object.keys(FS.nameTable).forEach(function(e) {
            for (var r = FS.nameTable[e]; r; ) {
                var t = r.name_next;
                -1 !== o.indexOf(r.mount) && FS.destroyNode(r),
                r = t
            }
        }),
        t.mounted = null;
        var i = t.mount.mounts.indexOf(n);
        assert(-1 !== i),
        t.mount.mounts.splice(i, 1)
    },
    lookup: function(e, r) {
        return e.node_ops.lookup(e, r)
    },
    mknod: function(e, r, t) {
        var n = FS.lookupPath(e, {
            parent: !0
        }).node
          , o = PATH.basename(e);
        if (!o || "." === o || ".." === o)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var i = FS.mayCreate(n, o);
        if (i)
            throw new FS.ErrnoError(i);
        if (!n.node_ops.mknod)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        return n.node_ops.mknod(n, o, r, t)
    },
    create: function(e, r) {
        return r = void 0 !== r ? r : 438,
        r &= 4095,
        r |= 32768,
        FS.mknod(e, r, 0)
    },
    mkdir: function(e, r) {
        return r = void 0 !== r ? r : 511,
        r &= 1023,
        r |= 16384,
        FS.mknod(e, r, 0)
    },
    mkdev: function(e, r, t) {
        return void 0 === t && (t = r,
        r = 438),
        r |= 8192,
        FS.mknod(e, r, t)
    },
    symlink: function(e, r) {
        if (!PATH.resolve(e))
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        var t = FS.lookupPath(r, {
            parent: !0
        }).node;
        if (!t)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        var n = PATH.basename(r)
          , o = FS.mayCreate(t, n);
        if (o)
            throw new FS.ErrnoError(o);
        if (!t.node_ops.symlink)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        return t.node_ops.symlink(t, n, e)
    },
    rename: function(r, t) {
        var e, n, o = PATH.dirname(r), i = PATH.dirname(t), a = PATH.basename(r), s = PATH.basename(t);
        try {
            e = FS.lookupPath(r, {
                parent: !0
            }).node,
            n = FS.lookupPath(t, {
                parent: !0
            }).node
        } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
        }
        if (!e || !n)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (e.mount !== n.mount)
            throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        var u, l = FS.lookupNode(e, a), c = PATH.relative(r, i);
        if ("." !== c.charAt(0))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if ("." !== (c = PATH.relative(t, o)).charAt(0))
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        try {
            u = FS.lookupNode(n, s)
        } catch (e) {}
        if (l !== u) {
            var d = FS.isDir(l.mode)
              , f = FS.mayDelete(e, a, d);
            if (f)
                throw new FS.ErrnoError(f);
            if (f = u ? FS.mayDelete(n, s, d) : FS.mayCreate(n, s))
                throw new FS.ErrnoError(f);
            if (!e.node_ops.rename)
                throw new FS.ErrnoError(ERRNO_CODES.EPERM);
            if (FS.isMountpoint(l) || u && FS.isMountpoint(u))
                throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
            if (n !== e && (f = FS.nodePermissions(e, "w")))
                throw new FS.ErrnoError(f);
            try {
                FS.trackingDelegate.willMovePath && FS.trackingDelegate.willMovePath(r, t)
            } catch (e) {
                console.log("FS.trackingDelegate['willMovePath']('" + r + "', '" + t + "') threw an exception: " + e.message)
            }
            FS.hashRemoveNode(l);
            try {
                e.node_ops.rename(l, n, s)
            } catch (e) {
                throw e
            } finally {
                FS.hashAddNode(l)
            }
            try {
                FS.trackingDelegate.onMovePath && FS.trackingDelegate.onMovePath(r, t)
            } catch (e) {
                console.log("FS.trackingDelegate['onMovePath']('" + r + "', '" + t + "') threw an exception: " + e.message)
            }
        }
    },
    rmdir: function(r) {
        var e = FS.lookupPath(r, {
            parent: !0
        }).node
          , t = PATH.basename(r)
          , n = FS.lookupNode(e, t)
          , o = FS.mayDelete(e, t, !0);
        if (o)
            throw new FS.ErrnoError(o);
        if (!e.node_ops.rmdir)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        if (FS.isMountpoint(n))
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        try {
            FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(r)
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + r + "') threw an exception: " + e.message)
        }
        e.node_ops.rmdir(e, t),
        FS.destroyNode(n);
        try {
            FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(r)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + r + "') threw an exception: " + e.message)
        }
    },
    readdir: function(e) {
        var r = FS.lookupPath(e, {
            follow: !0
        }).node;
        if (!r.node_ops.readdir)
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        return r.node_ops.readdir(r)
    },
    unlink: function(r) {
        var e = FS.lookupPath(r, {
            parent: !0
        }).node
          , t = PATH.basename(r)
          , n = FS.lookupNode(e, t)
          , o = FS.mayDelete(e, t, !1);
        if (o)
            throw o === ERRNO_CODES.EISDIR && (o = ERRNO_CODES.EPERM),
            new FS.ErrnoError(o);
        if (!e.node_ops.unlink)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        if (FS.isMountpoint(n))
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        try {
            FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(r)
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + r + "') threw an exception: " + e.message)
        }
        e.node_ops.unlink(e, t),
        FS.destroyNode(n);
        try {
            FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(r)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + r + "') threw an exception: " + e.message)
        }
    },
    readlink: function(e) {
        var r = FS.lookupPath(e).node;
        if (!r)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (!r.node_ops.readlink)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        return PATH.resolve(FS.getPath(r.parent), r.node_ops.readlink(r))
    },
    stat: function(e, r) {
        var t = FS.lookupPath(e, {
            follow: !r
        }).node;
        if (!t)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (!t.node_ops.getattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        return t.node_ops.getattr(t)
    },
    lstat: function(e) {
        return FS.stat(e, !0)
    },
    chmod: function(e, r, t) {
        var n;
        "string" == typeof e ? n = FS.lookupPath(e, {
            follow: !t
        }).node : n = e;
        if (!n.node_ops.setattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        n.node_ops.setattr(n, {
            mode: 4095 & r | -4096 & n.mode,
            timestamp: Date.now()
        })
    },
    lchmod: function(e, r) {
        FS.chmod(e, r, !0)
    },
    fchmod: function(e, r) {
        var t = FS.getStream(e);
        if (!t)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        FS.chmod(t.node, r)
    },
    chown: function(e, r, t, n) {
        var o;
        "string" == typeof e ? o = FS.lookupPath(e, {
            follow: !n
        }).node : o = e;
        if (!o.node_ops.setattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        o.node_ops.setattr(o, {
            timestamp: Date.now()
        })
    },
    lchown: function(e, r, t) {
        FS.chown(e, r, t, !0)
    },
    fchown: function(e, r, t) {
        var n = FS.getStream(e);
        if (!n)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        FS.chown(n.node, r, t)
    },
    truncate: function(e, r) {
        if (r < 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var t;
        "string" == typeof e ? t = FS.lookupPath(e, {
            follow: !0
        }).node : t = e;
        if (!t.node_ops.setattr)
            throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        if (FS.isDir(t.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        if (!FS.isFile(t.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var n = FS.nodePermissions(t, "w");
        if (n)
            throw new FS.ErrnoError(n);
        t.node_ops.setattr(t, {
            size: r,
            timestamp: Date.now()
        })
    },
    ftruncate: function(e, r) {
        var t = FS.getStream(e);
        if (!t)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (0 == (2097155 & t.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        FS.truncate(t.node, r)
    },
    utime: function(e, r, t) {
        var n = FS.lookupPath(e, {
            follow: !0
        }).node;
        n.node_ops.setattr(n, {
            timestamp: Math.max(r, t)
        })
    },
    open: function(r, e, t, n, o) {
        if ("" === r)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        var i;
        if (t = void 0 === t ? 438 : t,
        t = 64 & (e = "string" == typeof e ? FS.modeStringToFlags(e) : e) ? 4095 & t | 32768 : 0,
        "object" == typeof r)
            i = r;
        else {
            r = PATH.normalize(r);
            try {
                i = FS.lookupPath(r, {
                    follow: !(131072 & e)
                }).node
            } catch (e) {}
        }
        var a = !1;
        if (64 & e)
            if (i) {
                if (128 & e)
                    throw new FS.ErrnoError(ERRNO_CODES.EEXIST)
            } else
                i = FS.mknod(r, t, 0),
                a = !0;
        if (!i)
            throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        if (FS.isChrdev(i.mode) && (e &= -513),
        65536 & e && !FS.isDir(i.mode))
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        if (!a) {
            var s = FS.mayOpen(i, e);
            if (s)
                throw new FS.ErrnoError(s)
        }
        512 & e && FS.truncate(i, 0),
        e &= -641;
        var u = FS.createStream({
            node: i,
            path: FS.getPath(i),
            flags: e,
            seekable: !0,
            position: 0,
            stream_ops: i.stream_ops,
            ungotten: [],
            error: !1
        }, n, o);
        u.stream_ops.open && u.stream_ops.open(u),
        !Module.logReadFiles || 1 & e || (FS.readFiles || (FS.readFiles = {}),
        r in FS.readFiles || (FS.readFiles[r] = 1,
        Module.printErr("read file: " + r)));
        try {
            if (FS.trackingDelegate.onOpenFile) {
                var l = 0;
                1 != (2097155 & e) && (l |= FS.tracking.openFlags.READ),
                0 != (2097155 & e) && (l |= FS.tracking.openFlags.WRITE),
                FS.trackingDelegate.onOpenFile(r, l)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['onOpenFile']('" + r + "', flags) threw an exception: " + e.message)
        }
        return u
    },
    close: function(e) {
        e.getdents && (e.getdents = null);
        try {
            e.stream_ops.close && e.stream_ops.close(e)
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(e.fd)
        }
    },
    llseek: function(e, r, t) {
        if (!e.seekable || !e.stream_ops.llseek)
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        return e.position = e.stream_ops.llseek(e, r, t),
        e.ungotten = [],
        e.position
    },
    read: function(e, r, t, n, o) {
        if (n < 0 || o < 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if (1 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (FS.isDir(e.node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        if (!e.stream_ops.read)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        var i = !0;
        if (void 0 === o)
            o = e.position,
            i = !1;
        else if (!e.seekable)
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        var a = e.stream_ops.read(e, r, t, n, o);
        return i || (e.position += a),
        a
    },
    write: function(e, r, t, n, o, i) {
        if (n < 0 || o < 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if (0 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (FS.isDir(e.node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        if (!e.stream_ops.write)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        1024 & e.flags && FS.llseek(e, 0, 2);
        var a = !0;
        if (void 0 === o)
            o = e.position,
            a = !1;
        else if (!e.seekable)
            throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        var s = e.stream_ops.write(e, r, t, n, o, i);
        a || (e.position += s);
        try {
            e.path && FS.trackingDelegate.onWriteToFile && FS.trackingDelegate.onWriteToFile(e.path)
        } catch (e) {
            console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message)
        }
        return s
    },
    allocate: function(e, r, t) {
        if (r < 0 || t <= 0)
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        if (0 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        if (!FS.isFile(e.node.mode) && !FS.isDir(node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        if (!e.stream_ops.allocate)
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        e.stream_ops.allocate(e, r, t)
    },
    mmap: function(e, r, t, n, o, i, a) {
        if (1 == (2097155 & e.flags))
            throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        if (!e.stream_ops.mmap)
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        return e.stream_ops.mmap(e, r, t, n, o, i, a)
    },
    msync: function(e, r, t, n, o) {
        return e && e.stream_ops.msync ? e.stream_ops.msync(e, r, t, n, o) : 0
    },
    munmap: function(e) {
        return 0
    },
    ioctl: function(e, r, t) {
        if (!e.stream_ops.ioctl)
            throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        return e.stream_ops.ioctl(e, r, t)
    },
    readFile: function(e, r) {
        if ((r = r || {}).flags = r.flags || "r",
        r.encoding = r.encoding || "binary",
        "utf8" !== r.encoding && "binary" !== r.encoding)
            throw new Error('Invalid encoding type "' + r.encoding + '"');
        var t, n = FS.open(e, r.flags), o = FS.stat(e).size, i = new Uint8Array(o);
        return FS.read(n, i, 0, o, 0),
        "utf8" === r.encoding ? t = UTF8ArrayToString(i, 0) : "binary" === r.encoding && (t = i),
        FS.close(n),
        t
    },
    writeFile: function(e, r, t) {
        if ((t = t || {}).flags = t.flags || "w",
        t.encoding = t.encoding || "utf8",
        "utf8" !== t.encoding && "binary" !== t.encoding)
            throw new Error('Invalid encoding type "' + t.encoding + '"');
        var n = FS.open(e, t.flags, t.mode);
        if ("utf8" === t.encoding) {
            var o = new Uint8Array(lengthBytesUTF8(r) + 1)
              , i = stringToUTF8Array(r, o, 0, o.length);
            FS.write(n, o, 0, i, 0, t.canOwn)
        } else
            "binary" === t.encoding && FS.write(n, r, 0, r.length, 0, t.canOwn);
        FS.close(n)
    },
    cwd: function() {
        return FS.currentPath
    },
    chdir: function(e) {
        var r = FS.lookupPath(e, {
            follow: !0
        });
        if (!FS.isDir(r.node.mode))
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        var t = FS.nodePermissions(r.node, "x");
        if (t)
            throw new FS.ErrnoError(t);
        FS.currentPath = r.path
    },
    createDefaultDirectories: function() {
        FS.mkdir("/tmp"),
        FS.mkdir("/home"),
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices: function() {
        var e;
        if (FS.mkdir("/dev"),
        FS.registerDevice(FS.makedev(1, 3), {
            read: function() {
                return 0
            },
            write: function(e, r, t, n, o) {
                return n
            }
        }),
        FS.mkdev("/dev/null", FS.makedev(1, 3)),
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
        FS.mkdev("/dev/tty", FS.makedev(5, 0)),
        FS.mkdev("/dev/tty1", FS.makedev(6, 0)),
        "undefined" != typeof crypto) {
            var r = new Uint8Array(1);
            e = function() {
                return crypto.getRandomValues(r),
                r[0]
            }
        } else
            e = ENVIRONMENT_IS_NODE ? function() {
                return require("crypto").randomBytes(1)[0]
            }
            : function() {
                return 256 * Math.random() | 0
            }
            ;
        FS.createDevice("/dev", "random", e),
        FS.createDevice("/dev", "urandom", e),
        FS.mkdir("/dev/shm"),
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories: function() {
        FS.mkdir("/proc"),
        FS.mkdir("/proc/self"),
        FS.mkdir("/proc/self/fd"),
        FS.mount({
            mount: function() {
                var e = FS.createNode("/proc/self", "fd", 16895, 73);
                return e.node_ops = {
                    lookup: function(e, r) {
                        var t = +r
                          , n = FS.getStream(t);
                        if (!n)
                            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                        var o = {
                            parent: null,
                            mount: {
                                mountpoint: "fake"
                            },
                            node_ops: {
                                readlink: function() {
                                    return n.path
                                }
                            }
                        };
                        return o.parent = o
                    }
                },
                e
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams: function() {
        Module.stdin ? FS.createDevice("/dev", "stdin", Module.stdin) : FS.symlink("/dev/tty", "/dev/stdin"),
        Module.stdout ? FS.createDevice("/dev", "stdout", null, Module.stdout) : FS.symlink("/dev/tty", "/dev/stdout"),
        Module.stderr ? FS.createDevice("/dev", "stderr", null, Module.stderr) : FS.symlink("/dev/tty1", "/dev/stderr");
        var e = FS.open("/dev/stdin", "r");
        assert(0 === e.fd, "invalid handle for stdin (" + e.fd + ")");
        var r = FS.open("/dev/stdout", "w");
        assert(1 === r.fd, "invalid handle for stdout (" + r.fd + ")");
        var t = FS.open("/dev/stderr", "w");
        assert(2 === t.fd, "invalid handle for stderr (" + t.fd + ")")
    },
    ensureErrnoError: function() {
        FS.ErrnoError || (FS.ErrnoError = function(e, r) {
            this.node = r,
            this.setErrno = function(e) {
                for (var r in this.errno = e,
                ERRNO_CODES)
                    if (ERRNO_CODES[r] === e) {
                        this.code = r;
                        break
                    }
            }
            ,
            this.setErrno(e),
            this.message = ERRNO_MESSAGES[e],
            this.stack && (this.stack = demangleAll(this.stack))
        }
        ,
        FS.ErrnoError.prototype = new Error,
        FS.ErrnoError.prototype.constructor = FS.ErrnoError,
        [ERRNO_CODES.ENOENT].forEach(function(e) {
            FS.genericErrors[e] = new FS.ErrnoError(e),
            FS.genericErrors[e].stack = "<generic error, no stack>"
        }))
    },
    staticInit: function() {
        FS.ensureErrnoError(),
        FS.nameTable = new Array(4096),
        FS.mount(MEMFS, {}, "/"),
        FS.createDefaultDirectories(),
        FS.createDefaultDevices(),
        FS.createSpecialDirectories(),
        FS.filesystems = {
            MEMFS: MEMFS,
            IDBFS: IDBFS,
            NODEFS: NODEFS,
            WORKERFS: WORKERFS
        }
    },
    init: function(e, r, t) {
        assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),
        FS.init.initialized = !0,
        FS.ensureErrnoError(),
        Module.stdin = e || Module.stdin,
        Module.stdout = r || Module.stdout,
        Module.stderr = t || Module.stderr,
        FS.createStandardStreams()
    },
    quit: function() {
        FS.init.initialized = !1;
        var e = Module._fflush;
        e && e(0);
        for (var r = 0; r < FS.streams.length; r++) {
            var t = FS.streams[r];
            t && FS.close(t)
        }
    },
    getMode: function(e, r) {
        var t = 0;
        return e && (t |= 365),
        r && (t |= 146),
        t
    },
    joinPath: function(e, r) {
        var t = PATH.join.apply(null, e);
        return r && "/" == t[0] && (t = t.substr(1)),
        t
    },
    absolutePath: function(e, r) {
        return PATH.resolve(r, e)
    },
    standardizePath: function(e) {
        return PATH.normalize(e)
    },
    findObject: function(e, r) {
        var t = FS.analyzePath(e, r);
        return t.exists ? t.object : (___setErrNo(t.error),
        null)
    },
    analyzePath: function(e, r) {
        try {
            e = (n = FS.lookupPath(e, {
                follow: !r
            })).path
        } catch (e) {}
        var t = {
            isRoot: !1,
            exists: !1,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: !1,
            parentPath: null,
            parentObject: null
        };
        try {
            var n = FS.lookupPath(e, {
                parent: !0
            });
            t.parentExists = !0,
            t.parentPath = n.path,
            t.parentObject = n.node,
            t.name = PATH.basename(e),
            n = FS.lookupPath(e, {
                follow: !r
            }),
            t.exists = !0,
            t.path = n.path,
            t.object = n.node,
            t.name = n.node.name,
            t.isRoot = "/" === n.path
        } catch (e) {
            t.error = e.errno
        }
        return t
    },
    createFolder: function(e, r, t, n) {
        var o = PATH.join2("string" == typeof e ? e : FS.getPath(e), r)
          , i = FS.getMode(t, n);
        return FS.mkdir(o, i)
    },
    createPath: function(e, r, t, n) {
        e = "string" == typeof e ? e : FS.getPath(e);
        for (var o = r.split("/").reverse(); o.length; ) {
            var i = o.pop();
            if (i) {
                var a = PATH.join2(e, i);
                try {
                    FS.mkdir(a)
                } catch (e) {}
                e = a
            }
        }
        return a
    },
    createFile: function(e, r, t, n, o) {
        var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), r)
          , a = FS.getMode(n, o);
        return FS.create(i, a)
    },
    createDataFile: function(e, r, t, n, o, i) {
        var a = r ? PATH.join2("string" == typeof e ? e : FS.getPath(e), r) : e
          , s = FS.getMode(n, o)
          , u = FS.create(a, s);
        if (t) {
            if ("string" == typeof t) {
                for (var l = new Array(t.length), c = 0, d = t.length; c < d; ++c)
                    l[c] = t.charCodeAt(c);
                t = l
            }
            FS.chmod(u, 146 | s);
            var f = FS.open(u, "w");
            FS.write(f, t, 0, t.length, 0, i),
            FS.close(f),
            FS.chmod(u, s)
        }
        return u
    },
    createDevice: function(e, r, u, a) {
        var t = PATH.join2("string" == typeof e ? e : FS.getPath(e), r)
          , n = FS.getMode(!!u, !!a);
        FS.createDevice.major || (FS.createDevice.major = 64);
        var o = FS.makedev(FS.createDevice.major++, 0);
        return FS.registerDevice(o, {
            open: function(e) {
                e.seekable = !1
            },
            close: function(e) {
                a && a.buffer && a.buffer.length && a(10)
            },
            read: function(e, r, t, n, o) {
                for (var i = 0, a = 0; a < n; a++) {
                    var s;
                    try {
                        s = u()
                    } catch (e) {
                        throw new FS.ErrnoError(ERRNO_CODES.EIO)
                    }
                    if (void 0 === s && 0 === i)
                        throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
                    if (null == s)
                        break;
                    i++,
                    r[t + a] = s
                }
                return i && (e.node.timestamp = Date.now()),
                i
            },
            write: function(e, r, t, n, o) {
                for (var i = 0; i < n; i++)
                    try {
                        a(r[t + i])
                    } catch (e) {
                        throw new FS.ErrnoError(ERRNO_CODES.EIO)
                    }
                return n && (e.node.timestamp = Date.now()),
                i
            }
        }),
        FS.mkdev(t, n, o)
    },
    createLink: function(e, r, t, n, o) {
        var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), r);
        return FS.symlink(t, i)
    },
    forceLoadFile: function(e) {
        if (e.isDevice || e.isFolder || e.link || e.contents)
            return !0;
        var r = !0;
        if ("undefined" != typeof XMLHttpRequest)
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        if (!Module.read)
            throw new Error("Cannot load without read() or XMLHttpRequest.");
        try {
            e.contents = intArrayFromString(Module.read(e.url), !0),
            e.usedBytes = e.contents.length
        } catch (e) {
            r = !1
        }
        return r || ___setErrNo(ERRNO_CODES.EIO),
        r
    },
    createLazyFile: function(e, r, a, t, n) {
        function o() {
            this.lengthKnown = !1,
            this.chunks = []
        }
        if (o.prototype.get = function(e) {
            if (!(e > this.length - 1 || e < 0)) {
                var r = e % this.chunkSize
                  , t = e / this.chunkSize | 0;
                return this.getter(t)[r]
            }
        }
        ,
        o.prototype.setDataGetter = function(e) {
            this.getter = e
        }
        ,
        o.prototype.cacheLength = function() {
            var e = new XMLHttpRequest;
            if (e.open("HEAD", a, !1),
            e.send(null),
            !(200 <= e.status && e.status < 300 || 304 === e.status))
                throw new Error("Couldn't load " + a + ". Status: " + e.status);
            var r, n = Number(e.getResponseHeader("Content-length")), t = (r = e.getResponseHeader("Accept-Ranges")) && "bytes" === r, o = 1048576;
            t || (o = n);
            var i = this;
            i.setDataGetter(function(e) {
                var r = e * o
                  , t = (e + 1) * o - 1;
                if (t = Math.min(t, n - 1),
                void 0 === i.chunks[e] && (i.chunks[e] = function(e, r) {
                    if (r < e)
                        throw new Error("invalid range (" + e + ", " + r + ") or no bytes requested!");
                    if (n - 1 < r)
                        throw new Error("only " + n + " bytes available! programmer error!");
                    var t = new XMLHttpRequest;
                    if (t.open("GET", a, !1),
                    n !== o && t.setRequestHeader("Range", "bytes=" + e + "-" + r),
                    "undefined" != typeof Uint8Array && (t.responseType = "arraybuffer"),
                    t.overrideMimeType && t.overrideMimeType("text/plain; charset=x-user-defined"),
                    t.send(null),
                    !(200 <= t.status && t.status < 300 || 304 === t.status))
                        throw new Error("Couldn't load " + a + ". Status: " + t.status);
                    return void 0 !== t.response ? new Uint8Array(t.response || []) : intArrayFromString(t.responseText || "", !0)
                }(r, t)),
                void 0 === i.chunks[e])
                    throw new Error("doXHR failed!");
                return i.chunks[e]
            }),
            this._length = n,
            this._chunkSize = o,
            this.lengthKnown = !0
        }
        ,
        "undefined" != typeof XMLHttpRequest) {
            if (!ENVIRONMENT_IS_WORKER)
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var i = new o;
            Object.defineProperty(i, "length", {
                get: function() {
                    return this.lengthKnown || this.cacheLength(),
                    this._length
                }
            }),
            Object.defineProperty(i, "chunkSize", {
                get: function() {
                    return this.lengthKnown || this.cacheLength(),
                    this._chunkSize
                }
            });
            var s = {
                isDevice: !1,
                contents: i
            }
        } else
            s = {
                isDevice: !1,
                url: a
            };
        var u = FS.createFile(e, r, s, t, n);
        s.contents ? u.contents = s.contents : s.url && (u.contents = null,
        u.url = s.url),
        Object.defineProperty(u, "usedBytes", {
            get: function() {
                return this.contents.length
            }
        });
        var l = {};
        return Object.keys(u.stream_ops).forEach(function(e) {
            var r = u.stream_ops[e];
            l[e] = function() {
                if (!FS.forceLoadFile(u))
                    throw new FS.ErrnoError(ERRNO_CODES.EIO);
                return r.apply(null, arguments)
            }
        }),
        l.read = function(e, r, t, n, o) {
            if (!FS.forceLoadFile(u))
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
            var i = e.node.contents;
            if (o >= i.length)
                return 0;
            var a = Math.min(i.length - o, n);
            if (assert(0 <= a),
            i.slice)
                for (var s = 0; s < a; s++)
                    r[t + s] = i[o + s];
            else
                for (s = 0; s < a; s++)
                    r[t + s] = i.get(o + s);
            return a
        }
        ,
        u.stream_ops = l,
        u
    },
    createPreloadedFile: function(o, i, e, a, s, u, l, c, d, f) {
        Browser.init();
        var m = i ? PATH.resolve(PATH.join2(o, i)) : o
          , E = getUniqueRunDependency("cp " + m);
        function r(r) {
            function t(e) {
                f && f(),
                c || FS.createDataFile(o, i, e, a, s, d),
                u && u(),
                removeRunDependency(E)
            }
            var n = !1;
            Module.preloadPlugins.forEach(function(e) {
                n || e.canHandle(m) && (e.handle(r, m, t, function() {
                    l && l(),
                    removeRunDependency(E)
                }),
                n = !0)
            }),
            n || t(r)
        }
        addRunDependency(E),
        "string" == typeof e ? Browser.asyncLoad(e, function(e) {
            r(e)
        }, l) : r(e)
    },
    indexedDB: function() {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function() {
        return "EM_FS_" + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: function(r, s, u) {
        s = s || function() {}
        ,
        u = u || function() {}
        ;
        var e = FS.indexedDB();
        try {
            var l = e.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return u(e)
        }
        l.onupgradeneeded = function() {
            console.log("creating db"),
            l.result.createObjectStore(FS.DB_STORE_NAME)
        }
        ,
        l.onsuccess = function() {
            var e = l.result.transaction([FS.DB_STORE_NAME], "readwrite")
              , t = e.objectStore(FS.DB_STORE_NAME)
              , n = 0
              , o = 0
              , i = r.length;
            function a() {
                0 == o ? s() : u()
            }
            r.forEach(function(e) {
                var r = t.put(FS.analyzePath(e).object.contents, e);
                r.onsuccess = function() {
                    ++n + o == i && a()
                }
                ,
                r.onerror = function() {
                    n + ++o == i && a()
                }
            }),
            e.onerror = u
        }
        ,
        l.onerror = u
    },
    loadFilesFromDB: function(s, u, l) {
        u = u || function() {}
        ,
        l = l || function() {}
        ;
        var e = FS.indexedDB();
        try {
            var c = e.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return l(e)
        }
        c.onupgradeneeded = l,
        c.onsuccess = function() {
            var e = c.result;
            try {
                var r = e.transaction([FS.DB_STORE_NAME], "readonly")
            } catch (e) {
                return void l(e)
            }
            var t = r.objectStore(FS.DB_STORE_NAME)
              , n = 0
              , o = 0
              , i = s.length;
            function a() {
                0 == o ? u() : l()
            }
            s.forEach(function(e) {
                var r = t.get(e);
                r.onsuccess = function() {
                    FS.analyzePath(e).exists && FS.unlink(e),
                    FS.createDataFile(PATH.dirname(e), PATH.basename(e), r.result, !0, !0, !0),
                    ++n + o == i && a()
                }
                ,
                r.onerror = function() {
                    n + ++o == i && a()
                }
            }),
            r.onerror = l
        }
        ,
        c.onerror = l
    }
}
  , SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    mappings: {},
    umask: 511,
    calculateAt: function(e, r) {
        if ("/" !== r[0]) {
            var t;
            if (-100 === e)
                t = FS.cwd();
            else {
                var n = FS.getStream(e);
                if (!n)
                    throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                t = n.path
            }
            r = PATH.join2(t, r)
        }
        return r
    },
    doStat: function(e, r, t) {
        try {
            var n = e(r)
        } catch (e) {
            if (e && e.node && PATH.normalize(r) !== PATH.normalize(FS.getPath(e.node)))
                return -ERRNO_CODES.ENOTDIR;
            throw e
        }
        return HEAP32[t >> 2] = n.dev,
        HEAP32[t + 4 >> 2] = 0,
        HEAP32[t + 8 >> 2] = n.ino,
        HEAP32[t + 12 >> 2] = n.mode,
        HEAP32[t + 16 >> 2] = n.nlink,
        HEAP32[t + 20 >> 2] = n.uid,
        HEAP32[t + 24 >> 2] = n.gid,
        HEAP32[t + 28 >> 2] = n.rdev,
        HEAP32[t + 32 >> 2] = 0,
        HEAP32[t + 36 >> 2] = n.size,
        HEAP32[t + 40 >> 2] = 4096,
        HEAP32[t + 44 >> 2] = n.blocks,
        HEAP32[t + 48 >> 2] = n.atime.getTime() / 1e3 | 0,
        HEAP32[t + 52 >> 2] = 0,
        HEAP32[t + 56 >> 2] = n.mtime.getTime() / 1e3 | 0,
        HEAP32[t + 60 >> 2] = 0,
        HEAP32[t + 64 >> 2] = n.ctime.getTime() / 1e3 | 0,
        HEAP32[t + 68 >> 2] = 0,
        HEAP32[t + 72 >> 2] = n.ino,
        0
    },
    doMsync: function(e, r, t, n) {
        var o = new Uint8Array(HEAPU8.subarray(e, e + t));
        FS.msync(r, o, 0, t, n)
    },
    doMkdir: function(e, r) {
        return "/" === (e = PATH.normalize(e))[e.length - 1] && (e = e.substr(0, e.length - 1)),
        FS.mkdir(e, r, 0),
        0
    },
    doMknod: function(e, r, t) {
        switch (61440 & r) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
            break;
        default:
            return -ERRNO_CODES.EINVAL
        }
        return FS.mknod(e, r, t),
        0
    },
    doReadlink: function(e, r, t) {
        if (t <= 0)
            return -ERRNO_CODES.EINVAL;
        var n = FS.readlink(e);
        return writeStringToMemory(n = n.slice(0, Math.max(0, t)), r, !0),
        n.length
    },
    doAccess: function(e, r) {
        if (-8 & r)
            return -ERRNO_CODES.EINVAL;
        var t;
        t = FS.lookupPath(e, {
            follow: !0
        }).node;
        var n = "";
        return 4 & r && (n += "r"),
        2 & r && (n += "w"),
        1 & r && (n += "x"),
        n && FS.nodePermissions(t, n) ? -ERRNO_CODES.EACCES : 0
    },
    doDup: function(e, r, t) {
        var n = FS.getStream(t);
        return n && FS.close(n),
        FS.open(e, r, 0, t, t).fd
    },
    doReadv: function(e, r, t, n) {
        for (var o = 0, i = 0; i < t; i++) {
            var a = HEAP32[r + 8 * i >> 2]
              , s = HEAP32[r + (8 * i + 4) >> 2]
              , u = FS.read(e, HEAP8, a, s, n);
            if (u < 0)
                return -1;
            if (o += u,
            u < s)
                break
        }
        return o
    },
    doWritev: function(e, r, t, n) {
        for (var o = 0, i = 0; i < t; i++) {
            var a = HEAP32[r + 8 * i >> 2]
              , s = HEAP32[r + (8 * i + 4) >> 2]
              , u = FS.write(e, HEAP8, a, s, n);
            if (u < 0)
                return -1;
            o += u
        }
        return o
    },
    varargs: 0,
    get: function(e) {
        return SYSCALLS.varargs += 4,
        HEAP32[SYSCALLS.varargs - 4 >> 2]
    },
    getStr: function() {
        return Pointer_stringify(SYSCALLS.get())
    },
    getStreamFromFD: function() {
        var e = FS.getStream(SYSCALLS.get());
        if (!e)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return e
    },
    getSocketFromFD: function() {
        var e = SOCKFS.getSocket(SYSCALLS.get());
        if (!e)
            throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return e
    },
    getSocketAddress: function(e) {
        var r = SYSCALLS.get()
          , t = SYSCALLS.get();
        if (e && 0 === r)
            return null;
        var n = __read_sockaddr(r, t);
        if (n.errno)
            throw new FS.ErrnoError(n.errno);
        return n.addr = DNS.lookup_addr(n.addr) || n.addr,
        n
    },
    get64: function() {
        var e = SYSCALLS.get()
          , r = SYSCALLS.get();
        return assert(0 <= e ? 0 === r : -1 === r),
        e
    },
    getZero: function() {
        assert(0 === SYSCALLS.get())
    }
};
function ___syscall6(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD();
        return FS.close(t),
        0
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function _sbrk(e) {
    var r = _sbrk;
    r.called || (DYNAMICTOP = alignMemoryPage(DYNAMICTOP),
    r.called = !0,
    assert(Runtime.dynamicAlloc),
    r.alloc = Runtime.dynamicAlloc,
    Runtime.dynamicAlloc = function() {
        abort("cannot dynamically allocate, sbrk now has control")
    }
    );
    var t = DYNAMICTOP;
    if (0 != e && !r.alloc(e))
        return -1 >>> 0;
    return t
}
function _emscripten_memcpy_big(e, r, t) {
    return HEAPU8.set(HEAPU8.subarray(r, r + t), e),
    e
}
function _emscripten_set_main_loop_timing(e, r) {
    if (Browser.mainLoop.timingMode = e,
    Browser.mainLoop.timingValue = r,
    !Browser.mainLoop.func)
        return console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up."),
        1;
    if (0 == e)
        Browser.mainLoop.scheduler = function() {
            setTimeout(Browser.mainLoop.runner, r)
        }
        ,
        Browser.mainLoop.method = "timeout";
    else if (1 == e)
        Browser.mainLoop.scheduler = function() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner)
        }
        ,
        Browser.mainLoop.method = "rAF";
    else if (2 == e) {
        if (!window.setImmediate) {
            var t = [];
            window.addEventListener("message", function(e) {
                e.source === window && "__emcc" === e.data && (e.stopPropagation(),
                t.shift()())
            }, !0),
            window.setImmediate = function(e) {
                t.push(e),
                window.postMessage("__emcc", "*")
            }
        }
        Browser.mainLoop.scheduler = function() {
            window.setImmediate(Browser.mainLoop.runner)
        }
        ,
        Browser.mainLoop.method = "immediate"
    }
    return 0
}
function _emscripten_set_main_loop(o, e, r, i, t) {
    Module.noExitRuntime = !0,
    assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters."),
    Browser.mainLoop.func = o,
    Browser.mainLoop.arg = i;
    var a = Browser.mainLoop.currentlyRunningMainloop;
    if (Browser.mainLoop.runner = function() {
        if (!ABORT) {
            if (0 < Browser.mainLoop.queue.length) {
                var e = Date.now()
                  , r = Browser.mainLoop.queue.shift();
                if (r.func(r.arg),
                Browser.mainLoop.remainingBlockers) {
                    var t = Browser.mainLoop.remainingBlockers
                      , n = t % 1 == 0 ? t - 1 : Math.floor(t);
                    r.counted ? Browser.mainLoop.remainingBlockers = n : (n += .5,
                    Browser.mainLoop.remainingBlockers = (8 * t + n) / 9)
                }
                return console.log('main loop blocker "' + r.name + '" took ' + (Date.now() - e) + " ms"),
                Browser.mainLoop.updateStatus(),
                void setTimeout(Browser.mainLoop.runner, 0)
            }
            a < Browser.mainLoop.currentlyRunningMainloop || (Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0,
            1 == Browser.mainLoop.timingMode && 1 < Browser.mainLoop.timingValue && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0 ? Browser.mainLoop.scheduler() : ("timeout" === Browser.mainLoop.method && Module.ctx && (Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!"),
            Browser.mainLoop.method = ""),
            Browser.mainLoop.runIter(function() {
                void 0 !== i ? Runtime.dynCall("vi", o, [i]) : Runtime.dynCall("v", o)
            }),
            a < Browser.mainLoop.currentlyRunningMainloop || ("object" == typeof SDL && SDL.audio && SDL.audio.queueNewAudioData && SDL.audio.queueNewAudioData(),
            Browser.mainLoop.scheduler())))
        }
    }
    ,
    t || (e && 0 < e ? _emscripten_set_main_loop_timing(0, 1e3 / e) : _emscripten_set_main_loop_timing(1, 1),
    Browser.mainLoop.scheduler()),
    r)
        throw "SimulateInfiniteLoop"
}
Module._memcpy = _memcpy;
var Browser = {
    mainLoop: {
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function() {
            Browser.mainLoop.scheduler = null,
            Browser.mainLoop.currentlyRunningMainloop++
        },
        resume: function() {
            Browser.mainLoop.currentlyRunningMainloop++;
            var e = Browser.mainLoop.timingMode
              , r = Browser.mainLoop.timingValue
              , t = Browser.mainLoop.func;
            Browser.mainLoop.func = null,
            _emscripten_set_main_loop(t, 0, !1, Browser.mainLoop.arg, !0),
            _emscripten_set_main_loop_timing(e, r),
            Browser.mainLoop.scheduler()
        },
        updateStatus: function() {
            if (Module.setStatus) {
                var e = Module.statusMessage || "Please wait..."
                  , r = Browser.mainLoop.remainingBlockers
                  , t = Browser.mainLoop.expectedBlockers;
                r ? r < t ? Module.setStatus(e + " (" + (t - r) + "/" + t + ")") : Module.setStatus(e) : Module.setStatus("")
            }
        },
        runIter: function(e) {
            if (!ABORT) {
                if (Module.preMainLoop)
                    if (!1 === Module.preMainLoop())
                        return;
                try {
                    e()
                } catch (e) {
                    if (e instanceof ExitStatus)
                        return;
                    throw e && "object" == typeof e && e.stack && Module.printErr("exception thrown: " + [e, e.stack]),
                    e
                }
                Module.postMainLoop && Module.postMainLoop()
            }
        }
    },
    isFullScreen: !1,
    pointerLock: !1,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function() {
        if (Module.preloadPlugins || (Module.preloadPlugins = []),
        !Browser.initted) {
            Browser.initted = !0;
            try {
                new Blob,
                Browser.hasBlobConstructor = !0
            } catch (e) {
                Browser.hasBlobConstructor = !1,
                console.log("warning: no blob constructor, cannot create blobs with mimetypes")
            }
            Browser.BlobBuilder = "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : "undefined" != typeof WebKitBlobBuilder ? WebKitBlobBuilder : Browser.hasBlobConstructor ? null : console.log("warning: no BlobBuilder"),
            Browser.URLObject = "undefined" != typeof window ? window.URL ? window.URL : window.webkitURL : void 0,
            Module.noImageDecoding || void 0 !== Browser.URLObject || (console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."),
            Module.noImageDecoding = !0);
            var e = {
                canHandle: function(e) {
                    return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(e)
                },
                handle: function(r, t, n, o) {
                    var e = null;
                    if (Browser.hasBlobConstructor)
                        try {
                            (e = new Blob([r],{
                                type: Browser.getMimetype(t)
                            })).size !== r.length && (e = new Blob([new Uint8Array(r).buffer],{
                                type: Browser.getMimetype(t)
                            }))
                        } catch (e) {
                            Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder")
                        }
                    if (!e) {
                        var i = new Browser.BlobBuilder;
                        i.append(new Uint8Array(r).buffer),
                        e = i.getBlob()
                    }
                    var a = Browser.URLObject.createObjectURL(e);
                    assert("string" == typeof a, "createObjectURL must return a url as a string");
                    var s = new Image;
                    s.onload = function() {
                        assert(s.complete, "Image " + t + " could not be decoded");
                        var e = document.createElement("canvas");
                        e.width = s.width,
                        e.height = s.height,
                        e.getContext("2d").drawImage(s, 0, 0),
                        Module.preloadedImages[t] = e,
                        Browser.URLObject.revokeObjectURL(a),
                        n && n(r)
                    }
                    ,
                    s.onerror = function(e) {
                        console.log("Image " + a + " could not be decoded"),
                        o && o()
                    }
                    ,
                    s.src = a
                }
            };
            Module.preloadPlugins.push(e);
            var r = {
                canHandle: function(e) {
                    return !Module.noAudioDecoding && e.substr(-4)in {
                        ".ogg": 1,
                        ".wav": 1,
                        ".mp3": 1
                    }
                },
                handle: function(r, t, n, e) {
                    var o = !1;
                    function i(e) {
                        o || (o = !0,
                        Module.preloadedAudios[t] = e,
                        n && n(r))
                    }
                    function a() {
                        o || (o = !0,
                        Module.preloadedAudios[t] = new Audio,
                        e && e())
                    }
                    if (!Browser.hasBlobConstructor)
                        return a();
                    try {
                        var s = new Blob([r],{
                            type: Browser.getMimetype(t)
                        })
                    } catch (e) {
                        return a()
                    }
                    var u = Browser.URLObject.createObjectURL(s);
                    assert("string" == typeof u, "createObjectURL must return a url as a string");
                    var l = new Audio;
                    l.addEventListener("canplaythrough", function() {
                        i(l)
                    }, !1),
                    l.onerror = function(e) {
                        o || (console.log("warning: browser could not fully decode audio " + t + ", trying slower base64 approach"),
                        l.src = "data:audio/x-" + t.substr(-3) + ";base64," + function(e) {
                            for (var r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", t = "", n = 0, o = 0, i = 0; i < e.length; i++)
                                for (n = n << 8 | e[i],
                                o += 8; 6 <= o; ) {
                                    var a = n >> o - 6 & 63;
                                    o -= 6,
                                    t += r[a]
                                }
                            return 2 == o ? (t += r[(3 & n) << 4],
                            t += "==") : 4 == o && (t += r[(15 & n) << 2],
                            t += "="),
                            t
                        }(r),
                        i(l))
                    }
                    ,
                    l.src = u,
                    Browser.safeSetTimeout(function() {
                        i(l)
                    }, 1e4)
                }
            };
            Module.preloadPlugins.push(r);
            var t = Module.canvas;
            t && (t.requestPointerLock = t.requestPointerLock || t.mozRequestPointerLock || t.webkitRequestPointerLock || t.msRequestPointerLock || function() {}
            ,
            t.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {}
            ,
            t.exitPointerLock = t.exitPointerLock.bind(document),
            document.addEventListener("pointerlockchange", n, !1),
            document.addEventListener("mozpointerlockchange", n, !1),
            document.addEventListener("webkitpointerlockchange", n, !1),
            document.addEventListener("mspointerlockchange", n, !1),
            Module.elementPointerLock && t.addEventListener("click", function(e) {
                !Browser.pointerLock && t.requestPointerLock && (t.requestPointerLock(),
                e.preventDefault())
            }, !1))
        }
        function n() {
            Browser.pointerLock = document.pointerLockElement === t || document.mozPointerLockElement === t || document.webkitPointerLockElement === t || document.msPointerLockElement === t
        }
    },
    createContext: function(e, r, t, n) {
        if (r && Module.ctx && e == Module.canvas)
            return Module.ctx;
        var o, i;
        if (r) {
            var a = {
                antialias: !1,
                alpha: !1
            };
            if (n)
                for (var s in n)
                    a[s] = n[s];
            (i = GL.createContext(e, a)) && (o = GL.getContext(i).GLctx),
            e.style.backgroundColor = "black"
        } else
            o = e.getContext("2d");
        return o ? (t && (r || assert("undefined" == typeof GLctx, "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"),
        Module.ctx = o,
        r && GL.makeContextCurrent(i),
        Module.useWebGL = r,
        Browser.moduleContextCreatedCallbacks.forEach(function(e) {
            e()
        }),
        Browser.init()),
        o) : null
    },
    destroyContext: function(e, r, t) {},
    fullScreenHandlersInstalled: !1,
    lockPointer: void 0,
    resizeCanvas: void 0,
    requestFullScreen: function(e, r, t) {
        Browser.lockPointer = e,
        Browser.resizeCanvas = r,
        Browser.vrDevice = t,
        void 0 === Browser.lockPointer && (Browser.lockPointer = !0),
        void 0 === Browser.resizeCanvas && (Browser.resizeCanvas = !1),
        void 0 === Browser.vrDevice && (Browser.vrDevice = null);
        var n = Module.canvas;
        function o() {
            Browser.isFullScreen = !1;
            var e = n.parentNode;
            (document.webkitFullScreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.mozFullscreenElement || document.fullScreenElement || document.fullscreenElement || document.msFullScreenElement || document.msFullscreenElement || document.webkitCurrentFullScreenElement) === e ? (n.cancelFullScreen = document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen || document.exitFullscreen || function() {}
            ,
            n.cancelFullScreen = n.cancelFullScreen.bind(document),
            Browser.lockPointer && n.requestPointerLock(),
            Browser.isFullScreen = !0,
            Browser.resizeCanvas && Browser.setFullScreenCanvasSize()) : (e.parentNode.insertBefore(n, e),
            e.parentNode.removeChild(e),
            Browser.resizeCanvas && Browser.setWindowedCanvasSize()),
            Module.onFullScreen && Module.onFullScreen(Browser.isFullScreen),
            Browser.updateCanvasDimensions(n)
        }
        Browser.fullScreenHandlersInstalled || (Browser.fullScreenHandlersInstalled = !0,
        document.addEventListener("fullscreenchange", o, !1),
        document.addEventListener("mozfullscreenchange", o, !1),
        document.addEventListener("webkitfullscreenchange", o, !1),
        document.addEventListener("MSFullscreenChange", o, !1));
        var i = document.createElement("div");
        n.parentNode.insertBefore(i, n),
        i.appendChild(n),
        i.requestFullScreen = i.requestFullScreen || i.mozRequestFullScreen || i.msRequestFullscreen || (i.webkitRequestFullScreen ? function() {
            i.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
        }
        : null),
        t ? i.requestFullScreen({
            vrDisplay: t
        }) : i.requestFullScreen()
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function(e) {
        var r = Date.now();
        if (0 === Browser.nextRAF)
            Browser.nextRAF = r + 1e3 / 60;
        else
            for (; r + 2 >= Browser.nextRAF; )
                Browser.nextRAF += 1e3 / 60;
        var t = Math.max(Browser.nextRAF - r, 0);
        setTimeout(e, t)
    },
    requestAnimationFrame: function(e) {
        "undefined" == typeof window ? Browser.fakeRequestAnimationFrame(e) : (window.requestAnimationFrame || (window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || Browser.fakeRequestAnimationFrame),
        window.requestAnimationFrame(e))
    },
    safeCallback: function(e) {
        return function() {
            if (!ABORT)
                return e.apply(null, arguments)
        }
    },
    allowAsyncCallbacks: !0,
    queuedAsyncCallbacks: [],
    pauseAsyncCallbacks: function() {
        Browser.allowAsyncCallbacks = !1
    },
    resumeAsyncCallbacks: function() {
        if (Browser.allowAsyncCallbacks = !0,
        0 < Browser.queuedAsyncCallbacks.length) {
            var e = Browser.queuedAsyncCallbacks;
            Browser.queuedAsyncCallbacks = [],
            e.forEach(function(e) {
                e()
            })
        }
    },
    safeRequestAnimationFrame: function(e) {
        return Browser.requestAnimationFrame(function() {
            ABORT || (Browser.allowAsyncCallbacks ? e() : Browser.queuedAsyncCallbacks.push(e))
        })
    },
    safeSetTimeout: function(e, r) {
        return Module.noExitRuntime = !0,
        setTimeout(function() {
            ABORT || (Browser.allowAsyncCallbacks ? e() : Browser.queuedAsyncCallbacks.push(e))
        }, r)
    },
    safeSetInterval: function(e, r) {
        return Module.noExitRuntime = !0,
        setInterval(function() {
            ABORT || Browser.allowAsyncCallbacks && e()
        }, r)
    },
    getMimetype: function(e) {
        return {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            ogg: "audio/ogg",
            wav: "audio/wav",
            mp3: "audio/mpeg"
        }[e.substr(e.lastIndexOf(".") + 1)]
    },
    getUserMedia: function(e) {
        window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia),
        window.getUserMedia(e)
    },
    getMovementX: function(e) {
        return e.movementX || e.mozMovementX || e.webkitMovementX || 0
    },
    getMovementY: function(e) {
        return e.movementY || e.mozMovementY || e.webkitMovementY || 0
    },
    getMouseWheelDelta: function(e) {
        var r = 0;
        switch (e.type) {
        case "DOMMouseScroll":
            r = e.detail;
            break;
        case "mousewheel":
            r = e.wheelDelta;
            break;
        case "wheel":
            r = e.deltaY;
            break;
        default:
            throw "unrecognized mouse wheel event: " + e.type
        }
        return r
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function(e) {
        if (Browser.pointerLock)
            "mousemove" != e.type && "mozMovementX"in e ? Browser.mouseMovementX = Browser.mouseMovementY = 0 : (Browser.mouseMovementX = Browser.getMovementX(e),
            Browser.mouseMovementY = Browser.getMovementY(e)),
            "undefined" != typeof SDL ? (Browser.mouseX = SDL.mouseX + Browser.mouseMovementX,
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY) : (Browser.mouseX += Browser.mouseMovementX,
            Browser.mouseY += Browser.mouseMovementY);
        else {
            var r = Module.canvas.getBoundingClientRect()
              , t = Module.canvas.width
              , n = Module.canvas.height
              , o = void 0 !== window.scrollX ? window.scrollX : window.pageXOffset
              , i = void 0 !== window.scrollY ? window.scrollY : window.pageYOffset;
            if (assert(void 0 !== o && void 0 !== i, "Unable to retrieve scroll position, mouse positions likely broken."),
            "touchstart" === e.type || "touchend" === e.type || "touchmove" === e.type) {
                var a = e.touch;
                if (void 0 === a)
                    return;
                var s = a.pageX - (o + r.left)
                  , u = a.pageY - (i + r.top)
                  , l = {
                    x: s *= t / r.width,
                    y: u *= n / r.height
                };
                if ("touchstart" === e.type)
                    Browser.lastTouches[a.identifier] = l,
                    Browser.touches[a.identifier] = l;
                else if ("touchend" === e.type || "touchmove" === e.type) {
                    var c = Browser.touches[a.identifier];
                    c || (c = l),
                    Browser.lastTouches[a.identifier] = c,
                    Browser.touches[a.identifier] = l
                }
                return
            }
            var d = e.pageX - (o + r.left)
              , f = e.pageY - (i + r.top);
            d *= t / r.width,
            f *= n / r.height,
            Browser.mouseMovementX = d - Browser.mouseX,
            Browser.mouseMovementY = f - Browser.mouseY,
            Browser.mouseX = d,
            Browser.mouseY = f
        }
    },
    xhrLoad: function(e, r, t) {
        var n = new XMLHttpRequest;
        n.open("GET", e, !0),
        n.responseType = "arraybuffer",
        n.onload = function() {
            200 == n.status || 0 == n.status && n.response ? r(n.response) : t()
        }
        ,
        n.onerror = t,
        n.send(null)
    },
    asyncLoad: function(r, t, n, o) {
        Browser.xhrLoad(r, function(e) {
            assert(e, 'Loading data file "' + r + '" failed (no arrayBuffer).'),
            t(new Uint8Array(e)),
            o || removeRunDependency("al " + r)
        }, function(e) {
            if (!n)
                throw 'Loading data file "' + r + '" failed.';
            n()
        }),
        o || addRunDependency("al " + r)
    },
    resizeListeners: [],
    updateResizeListeners: function() {
        var r = Module.canvas;
        Browser.resizeListeners.forEach(function(e) {
            e(r.width, r.height)
        })
    },
    setCanvasSize: function(e, r, t) {
        var n = Module.canvas;
        Browser.updateCanvasDimensions(n, e, r),
        t || Browser.updateResizeListeners()
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullScreenCanvasSize: function() {
        if ("undefined" != typeof SDL) {
            var e = HEAPU32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2];
            e |= 8388608,
            HEAP32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2] = e
        }
        Browser.updateResizeListeners()
    },
    setWindowedCanvasSize: function() {
        if ("undefined" != typeof SDL) {
            var e = HEAPU32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2];
            e &= -8388609,
            HEAP32[SDL.screen + 0 * Runtime.QUANTUM_SIZE >> 2] = e
        }
        Browser.updateResizeListeners()
    },
    updateCanvasDimensions: function(e, r, t) {
        r && t ? (e.widthNative = r,
        e.heightNative = t) : (r = e.widthNative,
        t = e.heightNative);
        var n = r
          , o = t;
        if (Module.forcedAspectRatio && 0 < Module.forcedAspectRatio && (n / o < Module.forcedAspectRatio ? n = Math.round(o * Module.forcedAspectRatio) : o = Math.round(n / Module.forcedAspectRatio)),
        (document.webkitFullScreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.mozFullscreenElement || document.fullScreenElement || document.fullscreenElement || document.msFullScreenElement || document.msFullscreenElement || document.webkitCurrentFullScreenElement) === e.parentNode && "undefined" != typeof screen) {
            var i = Math.min(screen.width / n, screen.height / o);
            n = Math.round(n * i),
            o = Math.round(o * i)
        }
        Browser.resizeCanvas ? (e.width != n && (e.width = n),
        e.height != o && (e.height = o),
        void 0 !== e.style && (e.style.removeProperty("width"),
        e.style.removeProperty("height"))) : (e.width != r && (e.width = r),
        e.height != t && (e.height = t),
        void 0 !== e.style && (n != r || o != t ? (e.style.setProperty("width", n + "px", "important"),
        e.style.setProperty("height", o + "px", "important")) : (e.style.removeProperty("width"),
        e.style.removeProperty("height"))))
    },
    wgetRequests: {},
    nextWgetRequestHandle: 0,
    getNextWgetRequestHandle: function() {
        var e = Browser.nextWgetRequestHandle;
        return Browser.nextWgetRequestHandle++,
        e
    }
};
function _time(e) {
    var r = Date.now() / 1e3 | 0;
    return e && (HEAP32[e >> 2] = r),
    r
}
function _pthread_self() {
    return 0
}
function ___syscall140(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD()
          , n = SYSCALLS.get()
          , o = SYSCALLS.get()
          , i = SYSCALLS.get()
          , a = SYSCALLS.get()
          , s = o;
        return assert(0 === n),
        FS.llseek(t, s, a),
        HEAP32[i >> 2] = t.position,
        t.getdents && 0 === s && 0 === a && (t.getdents = null),
        0
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function ___syscall146(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD()
          , n = SYSCALLS.get()
          , o = SYSCALLS.get();
        return SYSCALLS.doWritev(t, n, o)
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
function ___syscall54(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD()
          , n = SYSCALLS.get();
        switch (n) {
        case 21505:
        case 21506:
            return t.tty ? 0 : -ERRNO_CODES.ENOTTY;
        case 21519:
            if (!t.tty)
                return -ERRNO_CODES.ENOTTY;
            var o = SYSCALLS.get();
            return HEAP32[o >> 2] = 0;
        case 21520:
            return t.tty ? -ERRNO_CODES.EINVAL : -ERRNO_CODES.ENOTTY;
        case 21531:
            o = SYSCALLS.get();
            return FS.ioctl(t, n, o);
        default:
            abort("bad ioctl syscall " + n)
        }
    } catch (e) {
        return void 0 !== FS && e instanceof FS.ErrnoError || abort(e),
        -e.errno
    }
}
if (FS.staticInit(),
__ATINIT__.unshift(function() {
    Module.noFSInit || FS.init.initialized || FS.init()
}),
__ATMAIN__.push(function() {
    FS.ignorePermissions = !1
}),
__ATEXIT__.push(function() {
    FS.quit()
}),
Module.FS_createFolder = FS.createFolder,
Module.FS_createPath = FS.createPath,
Module.FS_createDataFile = FS.createDataFile,
Module.FS_createPreloadedFile = FS.createPreloadedFile,
Module.FS_createLazyFile = FS.createLazyFile,
Module.FS_createLink = FS.createLink,
Module.FS_createDevice = FS.createDevice,
Module.FS_unlink = FS.unlink,
__ATINIT__.unshift(function() {
    TTY.init()
}),
__ATEXIT__.push(function() {
    TTY.shutdown()
}),
ENVIRONMENT_IS_NODE) {
    var fs = require("fs")
      , NODEJS_PATH = require("path");
    NODEFS.staticInit()
}
function nullFunc_ii(e) {
    Module.printErr("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"),
    Module.printErr("Build with ASSERTIONS=2 for more info."),
    abort(e)
}
function nullFunc_iiii(e) {
    Module.printErr("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"),
    Module.printErr("Build with ASSERTIONS=2 for more info."),
    abort(e)
}
function nullFunc_vi(e) {
    Module.printErr("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"),
    Module.printErr("Build with ASSERTIONS=2 for more info."),
    abort(e)
}
function invoke_ii(e, r) {
    try {
        return Module.dynCall_ii(e, r)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e)
            throw e;
        asm.setThrew(1, 0)
    }
}
function invoke_iiii(e, r, t, n) {
    try {
        return Module.dynCall_iiii(e, r, t, n)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e)
            throw e;
        asm.setThrew(1, 0)
    }
}
function invoke_vi(e, r) {
    try {
        Module.dynCall_vi(e, r)
    } catch (e) {
        if ("number" != typeof e && "longjmp" !== e)
            throw e;
        asm.setThrew(1, 0)
    }
}
Module.requestFullScreen = function(e, r, t) {
    Browser.requestFullScreen(e, r, t)
}
,
Module.requestAnimationFrame = function(e) {
    Browser.requestAnimationFrame(e)
}
,
Module.setCanvasSize = function(e, r, t) {
    Browser.setCanvasSize(e, r, t)
}
,
Module.pauseMainLoop = function() {
    Browser.mainLoop.pause()
}
,
Module.resumeMainLoop = function() {
    Browser.mainLoop.resume()
}
,
Module.getUserMedia = function() {
    Browser.getUserMedia()
}
,
Module.createContext = function(e, r, t, n) {
    return Browser.createContext(e, r, t, n)
}
,
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP),
staticSealed = !0,
STACK_MAX = STACK_BASE + TOTAL_STACK,
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX),
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack"),
Module.asmGlobalArg = {
    Math: Math,
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    NaN: NaN,
    Infinity: 1 / 0
},
Module.asmLibraryArg = {
    abort: abort,
    assert: assert,
    nullFunc_ii: nullFunc_ii,
    nullFunc_iiii: nullFunc_iiii,
    nullFunc_vi: nullFunc_vi,
    invoke_ii: invoke_ii,
    invoke_iiii: invoke_iiii,
    invoke_vi: invoke_vi,
    _pthread_cleanup_pop: _pthread_cleanup_pop,
    _pthread_self: _pthread_self,
    _sysconf: _sysconf,
    ___lock: ___lock,
    ___syscall6: ___syscall6,
    ___setErrNo: ___setErrNo,
    _abort: _abort,
    _sbrk: _sbrk,
    _time: _time,
    _pthread_cleanup_push: _pthread_cleanup_push,
    _emscripten_memcpy_big: _emscripten_memcpy_big,
    ___syscall54: ___syscall54,
    ___unlock: ___unlock,
    ___syscall140: ___syscall140,
    _emscripten_set_main_loop_timing: _emscripten_set_main_loop_timing,
    _emscripten_set_main_loop: _emscripten_set_main_loop,
    ___syscall146: ___syscall146,
    STACKTOP: STACKTOP,
    STACK_MAX: STACK_MAX,
    tempDoublePtr: tempDoublePtr,
    ABORT: ABORT
};
var asm = function(e, r, t) {
    var d = new e.Int8Array(t)
      , f = new e.Int16Array(t)
      , nl = new e.Int32Array(t)
      , Y = (new e.Uint8Array(t),
    new e.Uint16Array(t),
    new e.Uint32Array(t),
    new e.Float32Array(t),
    new e.Float64Array(t),
    0 | r.STACKTOP)
      , j = 0 | r.STACK_MAX
      , n = (r.tempDoublePtr,
    r.ABORT,
    0)
      , o = (e.NaN,
    e.Infinity,
    0)
      , V = (e.Math.floor,
    e.Math.abs,
    e.Math.sqrt,
    e.Math.pow,
    e.Math.cos,
    e.Math.sin,
    e.Math.tan,
    e.Math.acos,
    e.Math.asin,
    e.Math.atan,
    e.Math.atan2,
    e.Math.exp,
    e.Math.log,
    e.Math.ceil,
    e.Math.imul,
    e.Math.min,
    e.Math.clz32,
    r.abort)
      , i = (r.assert,
    r.nullFunc_ii)
      , a = r.nullFunc_iiii
      , s = r.nullFunc_vi
      , W = (r.invoke_ii,
    r.invoke_iiii,
    r.invoke_vi,
    r._pthread_cleanup_pop)
      , u = r._pthread_self
      , ol = r._sysconf
      , m = r.___lock
      , l = r.___syscall6
      , il = (r.___setErrNo,
    r._abort)
      , al = r._sbrk
      , sl = r._time
      , q = r._pthread_cleanup_push
      , c = r._emscripten_memcpy_big
      , E = r.___syscall54
      , S = r.___unlock
      , p = r.___syscall140
      , K = (r._emscripten_set_main_loop_timing,
    r._emscripten_set_main_loop,
    r.___syscall146);
    function h(e) {
        e |= 0;
        var r, t, n, o = 0, i = 0, a = 0, s = 0;
        return (0 | j) <= (0 | (Y = (n = Y) + 16 | 0)) && V(),
        0 <= (0 | (o = e) << 16 >> 16) ? s = 213 : (s = 85,
        o = (0 | (o = i = 65535 & ((0 - (o << 16 >> 16) | 0) - 1 | 0)) << 16 >> 16) < 0 ? 32767 : i),
        8 <= (0 | (t = 0 | _(o, 668, 8)) << 16 >> 16) ? (Y = n,
        0 | 255 & (127 ^ s << 16 >> 16)) : (a = 255 & t << 16 >> 16 << 4,
        r = o << 16 >> 16,
        a = (0 | t << 16 >> 16) < 2 ? 255 & (255 & a | 15 & r >> 4) : 255 & (255 & a | 15 & r >> ((t << 16 >> 16) + 3 | 0)),
        Y = n,
        0 | 255 & (255 & a ^ s << 16 >> 16))
    }
    function _(e, r, t) {
        e |= 0,
        r |= 0,
        t |= 0;
        var n, o, i, a = 0, s = 0, u = 0, l = 0, c = 0;
        for ((0 | j) <= (0 | (Y = (i = Y) + 16 | 0)) && V(),
        n = e,
        u = r,
        o = t,
        l = 0; ; ) {
            if (!((0 | l << 16 >> 16) < (0 | o << 16 >> 16))) {
                c = 6;
                break
            }
            if (u = (a = u) + 2 | 0,
            s = l,
            (0 | n << 16 >> 16) <= (0 | (0 | f[a >> 1]) << 16 >> 16)) {
                c = 4;
                break
            }
            l = s + 1 << 16 >> 16
        }
        return 4 == (0 | c) ? (Y = i,
        0 | s) : 6 == (0 | c) ? (Y = i,
        0 | o) : 0
    }
    function w(e) {
        e |= 0;
        var r, t, n, o = 0, i = 0;
        switch ((0 | j) <= (0 | (Y = (n = Y) + 16 | 0)) && V(),
        i = 65535 & (15 & (255 & (o = 255 & (85 ^ 255 & (o = e))))) << 4,
        0 | (t = 65535 & (112 & (255 & o)) >>> 4) << 16 >> 16) {
        case 0:
            i = 65535 & ((i << 16 >> 16) + 8 | 0);
            break;
        case 1:
            i = 65535 & ((i << 16 >> 16) + 264 | 0);
            break;
        default:
            i = 65535 & (i = 65535 & ((i << 16 >> 16) + 264 | 0)) << 16 >> 16 << ((t << 16 >> 16) - 1 | 0)
        }
        return r = i << 16 >> 16,
        Y = n,
        0 | 65535 & (0 != (0 | 128 & (255 & o)) ? r : 0 - r | 0)
    }
    function F(e) {
        e |= 0;
        var r, t, n, o, i = 0, a = 0;
        return (0 | j) <= (0 | (Y = (o = Y) + 16 | 0)) && V(),
        t = (r = i = e) << 16 >> 16,
        a = (0 | r << 16 >> 16) < 0 ? (i = 65535 & (132 - t | 0),
        127) : (i = 65535 & (t + 132 | 0),
        255),
        8 <= (0 | (n = 0 | _(i, 668, 8)) << 16 >> 16) ? (Y = o,
        0 | 255 & (127 ^ a << 16 >> 16)) : (Y = o,
        0 | 255 & (255 & (255 & (n << 16 >> 16 << 4 | 15 & i << 16 >> 16 >> ((n << 16 >> 16) + 3 | 0))) ^ a << 16 >> 16))
    }
    function g(e) {
        e |= 0;
        var r, t, n = 0;
        return (0 | j) <= (0 | (Y = (t = Y) + 16 | 0)) && V(),
        r = (65535 & (65535 & (((15 & (255 & (n = 255 & (-1 ^ 255 & (n = e))))) << 3) + 132 | 0)) << 16 >> 16 << ((112 & (255 & n)) >>> 4)) << 16 >> 16,
        Y = t,
        0 | 65535 & (0 != (0 | 128 & (255 & n)) ? 132 - r | 0 : r - 132 | 0)
    }
    function ul() {
        var e = 0;
        return Y,
        0 | (0 == (0 | (0 | nl[2])) ? 56 : (e = 0 | u(),
        0 | nl[(e + 60 | 0) >> 2]))
    }
    function X(e) {
        var r = 0
          , t = 0;
        return Y,
        0 | (4294963200 < (e |= 0) >>> 0 ? (r = 0 - e | 0,
        t = 0 | ul(),
        nl[t >> 2] = r,
        -1) : e)
    }
    function v(e) {
        return Y,
        0
    }
    function y(e, r, t) {
        e |= 0,
        r |= 0,
        t |= 0;
        var n, o, i, a, s, u, l, c, d, f, m, E = 0, S = 0, p = 0, h = 0, _ = 0, w = 0, F = 0, g = 0, v = 0, y = 0, M = 0, R = 0, O = 0, A = 0, T = 0, b = 0, N = 0, D = 0, k = 0, P = 0, C = 0, L = 0, I = 0, B = 0, x = 0, H = 0, U = 0, z = 0;
        for ((0 | j) <= (0 | (Y = (m = Y) + 48 | 0)) && V(),
        f = m + 16 | 0,
        c = (d = m) + 32 | 0,
        o = 0 | nl[(n = e + 28 | 0) >> 2],
        nl[c >> 2] = o,
        s = c + 4 | 0,
        l = (0 | nl[(u = e + 20 | 0) >> 2]) - o | 0,
        nl[s >> 2] = l,
        nl[(c + 8 | 0) >> 2] = r,
        i = e + 60 | 0,
        a = e + 44 | 0,
        U = l + (nl[((C = c) + 12 | 0) >> (B = 2)] = t) | 0; ; ) {
            if ((0 | U) == (0 | (k = 0 == (0 | (0 | nl[2])) ? (h = 0 | nl[i >> 2],
            nl[f >> 2] = h,
            nl[(f + 4 | 0) >> 2] = C,
            nl[(f + 8 | 0) >> 2] = B,
            0 | X(0 | K(146, 0 | f))) : (q(4, 0 | e),
            S = 0 | nl[i >> 2],
            nl[d >> 2] = S,
            nl[(d + 4 | 0) >> 2] = C,
            nl[(d + 8 | 0) >> 2] = B,
            p = 0 | X(0 | K(146, 0 | d)),
            W(0),
            p)))) {
                z = 6;
                break
            }
            if ((0 | k) < 0) {
                L = C,
                x = B,
                z = 8;
                break
            }
            v = U - k | 0,
            H = (y = 0 | nl[(C + 4 | 0) >> 2]) >>> 0 < k >>> 0 ? (M = 0 | nl[a >> 2],
            nl[n >> 2] = M,
            nl[u >> 2] = M,
            R = k - y | 0,
            O = C + 8 | 0,
            A = B + -1 | 0,
            D = 0 | nl[(C + 12 | 0) >> 2],
            P = R,
            I = O,
            A) : 2 == (0 | B) ? (T = (0 | nl[n >> 2]) + k | 0,
            nl[n >> 2] = T,
            D = y,
            P = k,
            I = C,
            2) : (D = y,
            P = k,
            I = C,
            B),
            b = (0 | nl[I >> 2]) + P | 0,
            nl[I >> 2] = b,
            N = D - P | 0,
            nl[(I + 4 | 0) >> 2] = N,
            C = I,
            B = H,
            U = v
        }
        return 6 == (0 | z) ? (w = (_ = 0 | nl[a >> 2]) + (0 | nl[(e + 48 | 0) >> 2]) | 0,
        nl[(e + 16 | 0) >> 2] = w,
        F = _,
        nl[n >> 2] = F,
        nl[u >> 2] = F,
        E = t) : 8 == (0 | z) && (nl[(e + 16 | 0) >> 2] = 0,
        nl[n >> 2] = 0,
        g = 32 | ((nl[u >> 2] = 0) | nl[e >> 2]),
        nl[e >> 2] = g,
        E = 2 == (0 | x) ? 0 : t - (0 | nl[(L + 4 | 0) >> 2]) | 0),
        Y = m,
        0 | E
    }
    function M(e) {
        var r, t, n, o = 0, i = 0, a = 0, s = 0, u = 0, l = 0, c = 0, d = 0, f = 0;
        return Y,
        t = 0 | nl[(r = (e |= 0) + 20 | 0) >> 2],
        (0 | nl[(n = e + 28 | 0) >> 2]) >>> 0 < t >>> 0 ? (c = 0 | nl[(e + 36 | 0) >> 2],
        T[7 & c](e, 0, 0),
        0 == (0 | (0 | nl[r >> 2])) ? o = -1 : f = 3) : f = 3,
        3 == (0 | f) && ((i = 0 | nl[(d = e + 4 | 0) >> 2]) >>> 0 < (s = 0 | nl[(a = e + 8 | 0) >> 2]) >>> 0 && (u = 0 | nl[(e + 40 | 0) >> 2],
        l = i - s | 0,
        T[7 & u](e, l, 1)),
        nl[(e + 16 | 0) >> 2] = 0,
        nl[n >> 2] = 0,
        nl[r >> 2] = 0,
        nl[a >> 2] = 0,
        o = nl[d >> 2] = 0),
        0 | o
    }
    function R(e, r, t) {
        return 0,
        0,
        0,
        a(1),
        0
    }
    function O(e) {
        s(2)
    }
    var A = [function(e) {
        return i(0),
        0
    }
    , function(e) {
        var r, t, n, o;
        return e |= 0,
        (0 | j) <= (0 | (Y = (o = Y) + 16 | 0)) && V(),
        n = o,
        r = 0 | nl[(e + 60 | 0) >> 2],
        nl[n >> 2] = r,
        t = 0 | X(0 | l(6, 0 | n)),
        Y = o,
        0 | t
    }
    ]
      , T = [R, R, function(e, r, t) {
        e |= 0,
        r |= 0,
        t |= 0;
        var n, o, i, a, s = 0;
        return (0 | j) <= (0 | (Y = (a = Y) + 80 | 0)) && V(),
        o = (i = a) + 12 | 0,
        nl[(e + 36 | 0) >> 2] = 5,
        0 == (0 | 64 & (0 | nl[e >> 2])) && (s = 0 | nl[(e + 60 | 0) >> 2],
        nl[i >> 2] = s,
        nl[(i + 4 | 0) >> 2] = 21505,
        nl[(i + 8 | 0) >> 2] = o,
        0 == (0 | E(54, 0 | i)) || (d[(e + 75 | 0) >> 0] = -1)),
        n = 0 | y(e, r, t),
        Y = a,
        0 | n
    }
    , function(e, r, t) {
        e |= 0,
        r |= 0,
        t |= 0;
        var n, o, i, a, s = 0;
        return (0 | j) <= (0 | (Y = (a = Y) + 32 | 0)) && V(),
        o = (i = a) + 20 | 0,
        n = 0 | nl[(e + 60 | 0) >> 2],
        nl[i >> 2] = n,
        nl[(i + 4 | 0) >> 2] = 0,
        nl[(i + 8 | 0) >> 2] = r,
        nl[(i + 12 | 0) >> 2] = o,
        nl[(i + 16 | 0) >> 2] = t,
        s = (0 | X(0 | p(140, 0 | i))) < 0 ? nl[o >> 2] = -1 : 0 | nl[o >> 2],
        Y = a,
        0 | s
    }
    , R, y, R, R]
      , b = [O, O, O, O, function(e) {
        nl[(68 + (e |= 0) | 0) >> 2]
    }
    , O, O, O];
    return {
        _G711Encoder: function(e, r, t, n) {
            e |= 0,
            r |= 0,
            t |= 0,
            n |= 0;
            var o, i, a, s, u = 0, l = 0, c = 0;
            if ((0 | j) <= (0 | (Y = (s = Y) + 32 | 0)) && V(),
            o = e,
            i = r,
            a = t,
            (c = 0) == (0 | n)) {
                for (; (0 | c) < (0 | a); )
                    u = 0 | h(0 | f[(o + (c << 1) | 0) >> 1]),
                    d[(i + c | 0) >> 0] = u,
                    c = c + 1 | 0;
                Y = s
            } else {
                for (; (0 | c) < (0 | a); )
                    l = 0 | F(0 | f[(o + (c << 1) | 0) >> 1]),
                    d[(i + c | 0) >> 0] = l,
                    c = c + 1 | 0;
                Y = s
            }
        },
        _int_add: function(e, r) {
            var t;
            return e |= 0,
            r |= 0,
            (0 | j) <= (0 | (Y = (t = Y) + 16 | 0)) && V(),
            Y = t,
            0 | e + r
        },
        _ch_test2: function(e, r, t) {
            e |= 0,
            r |= 0,
            t |= 0;
            var n, o, i, a, s = 0, u = 0;
            for ((0 | j) <= (0 | (Y = (a = Y) + 16 | 0)) && V(),
            n = e,
            o = r,
            i = t,
            u = 0; (0 | u) < (0 | i); )
                s = 0 | d[(n + u | 0) >> 0],
                d[(o + u | 0) >> 0] = s,
                u = u + 1 | 0;
            return d[(o + u | 0) >> 0] = 0,
            Y = a,
            1
        },
        _memcpy: function(e, r, t) {
            var n;
            if (e |= 0,
            r |= 0,
            4096 <= (0 | (t |= 0)))
                return 0 | c(0 | e, 0 | r, 0 | t);
            if (n = 0 | e,
            (3 & e) == (3 & r)) {
                for (; 3 & e; ) {
                    if (0 == (0 | t))
                        return 0 | n;
                    d[e >> 0] = 0 | d[r >> 0],
                    e = e + 1 | 0,
                    r = r + 1 | 0,
                    t = t - 1 | 0
                }
                for (; 4 <= (0 | t); )
                    nl[e >> 2] = 0 | nl[r >> 2],
                    e = e + 4 | 0,
                    r = r + 4 | 0,
                    t = t - 4 | 0
            }
            for (; 0 < (0 | t); )
                d[e >> 0] = 0 | d[r >> 0],
                e = e + 1 | 0,
                r = r + 1 | 0,
                t = t - 1 | 0;
            return 0 | n
        },
        _ch_test1: function(e) {
            var r, t;
            return e |= 0,
            (0 | j) <= (0 | (Y = (t = Y) + 16 | 0)) && V(),
            r = 0 | nl[e >> 2],
            Y = t,
            0 | r + 100
        },
        _memset: function(e, r, t) {
            r |= 0;
            var n, o = 0, i = 0, a = 0;
            if (n = (e |= 0) + (t |= 0) | 0,
            20 <= (0 | t)) {
                if (o = (r &= 255) | r << 8 | r << 16 | r << 24,
                i = -4 & n,
                a = 3 & e)
                    for (a = e + 4 - a | 0; (0 | e) < (0 | a); )
                        d[e >> 0] = r,
                        e = e + 1 | 0;
                for (; (0 | e) < (0 | i); )
                    nl[e >> 2] = o,
                    e = e + 4 | 0
            }
            for (; (0 | e) < (0 | n); )
                d[e >> 0] = r,
                e = e + 1 | 0;
            return e - t | 0
        },
        _malloc: function(e) {
            var r, t, n, o, i, a, s, u, l, c, d, f, m, E = 0, S = 0, p = 0, h = 0, _ = 0, w = 0, F = 0, g = 0, v = 0, y = 0, M = 0, R = 0, O = 0, A = 0, T = 0, b = 0, N = 0, D = 0, k = 0, P = 0, C = 0, L = 0, I = 0, B = 0, x = 0, H = 0, U = 0, z = 0, Y = 0, j = 0, V = 0, W = 0, q = 0, K = 0, X = 0, G = 0, J = 0, Z = 0, Q = 0, $ = 0, ee = 0, re = 0, te = 0, ne = 0, oe = 0, ie = 0, ae = 0, se = 0, ue = 0, le = 0, ce = 0, de = 0, fe = 0, me = 0, Ee = 0, Se = 0, pe = 0, he = 0, _e = 0, we = 0, Fe = 0, ge = 0, ve = 0, ye = 0, Me = 0, Re = 0, Oe = 0, Ae = 0, Te = 0, be = 0, Ne = 0, De = 0, ke = 0, Pe = 0, Ce = 0, Le = 0, Ie = 0, Be = 0, xe = 0, He = 0, Ue = 0, ze = 0, Ye = 0, je = 0, Ve = 0, We = 0, qe = 0, Ke = 0, Xe = 0, Ge = 0, Je = 0, Ze = 0, Qe = 0, $e = 0, er = 0, rr = 0, tr = 0, nr = 0, or = 0, ir = 0, ar = 0, sr = 0, ur = 0, lr = 0, cr = 0, dr = 0, fr = 0, mr = 0, Er = 0, Sr = 0, pr = 0, hr = 0, _r = 0, wr = 0, Fr = 0, gr = 0, vr = 0, yr = 0, Mr = 0, Rr = 0, Or = 0, Ar = 0, Tr = 0, br = 0, Nr = 0, Dr = 0, kr = 0, Pr = 0, Cr = 0, Lr = 0, Ir = 0, Br = 0, xr = 0, Hr = 0, Ur = 0, zr = 0, Yr = 0, jr = 0, Vr = 0, Wr = 0, qr = 0, Kr = 0, Xr = 0, Gr = 0, Jr = 0, Zr = 0, Qr = 0, $r = 0, et = 0, rt = 0, tt = 0, nt = 0, ot = 0, it = 0, at = 0, st = 0, ut = 0, lt = 0, ct = 0, dt = 0, ft = 0, mt = 0, Et = 0, St = 0, pt = 0, ht = 0, _t = 0, wt = 0, Ft = 0, gt = 0, vt = 0, yt = 0, Mt = 0, Rt = 0, Ot = 0, At = 0, Tt = 0, bt = 0, Nt = 0, Dt = 0, kt = 0, Pt = 0, Ct = 0, Lt = 0, It = 0, Bt = 0, xt = 0, Ht = 0, Ut = 0, zt = 0, Yt = 0, jt = 0, Vt = 0, Wt = 0, qt = 0, Kt = 0, Xt = 0, Gt = 0, Jt = 0, Zt = 0, Qt = 0, $t = 0, en = 0, rn = 0, tn = 0, nn = 0, on = 0, an = 0, sn = 0, un = 0, ln = 0, cn = 0, dn = 0, fn = 0, mn = 0, En = 0, Sn = 0, pn = 0, hn = 0, _n = 0, wn = 0, Fn = 0, gn = 0, vn = 0, yn = 0, Mn = 0, Rn = 0, On = 0, An = 0, Tn = 0, bn = 0, Nn = 0, Dn = 0, kn = 0, Pn = 0, Cn = 0, Ln = 0, In = 0, Bn = 0, xn = 0, Hn = 0, Un = 0, zn = 0, Yn = 0, jn = 0, Vn = 0, Wn = 0, qn = 0, Kn = 0, Xn = 0, Gn = 0, Jn = 0, Zn = 0, Qn = 0, $n = 0, eo = 0, ro = 0, to = 0, no = 0, oo = 0, io = 0, ao = 0, so = 0, uo = 0, lo = 0, co = 0, fo = 0, mo = 0, Eo = 0, So = 0, po = 0, ho = 0, _o = 0, wo = 0, Fo = 0, go = 0, vo = 0, yo = 0, Mo = 0, Ro = 0, Oo = 0, Ao = 0, To = 0, bo = 0, No = 0, Do = 0, ko = 0, Po = 0, Co = 0, Lo = 0, Io = 0, Bo = 0, xo = 0, Ho = 0, Uo = 0, zo = 0, Yo = 0, jo = 0, Vo = 0, Wo = 0, qo = 0, Ko = 0, Xo = 0, Go = 0, Jo = 0, Zo = 0, Qo = 0, $o = 0, ei = 0, ri = 0, ti = 0, ni = 0, oi = 0, ii = 0, ai = 0, si = 0, ui = 0, li = 0, ci = 0, di = 0, fi = 0, mi = 0, Ei = 0, Si = 0, pi = 0, hi = 0, _i = 0, wi = 0, Fi = 0, gi = 0, vi = 0, yi = 0, Mi = 0, Ri = 0, Oi = 0, Ai = 0, Ti = 0, bi = 0, Ni = 0, Di = 0, ki = 0, Pi = 0, Ci = 0, Li = 0, Ii = 0, Bi = 0, xi = 0, Hi = 0, Ui = 0, zi = 0, Yi = 0, ji = 0, Vi = 0, Wi = 0, qi = 0, Ki = 0, Xi = 0, Gi = 0, Ji = 0, Zi = 0, Qi = 0, $i = 0, ea = 0, ra = 0, ta = 0, na = 0, oa = 0, ia = 0, aa = 0, sa = 0, ua = 0, la = 0, ca = 0, da = 0, fa = 0, ma = 0, Ea = 0, Sa = 0, pa = 0, ha = 0, _a = 0, wa = 0, Fa = 0, ga = 0, va = 0, ya = 0, Ma = 0, Ra = 0, Oa = 0, Aa = 0, Ta = 0, ba = 0, Na = 0, Da = 0, ka = 0, Pa = 0, Ca = 0, La = 0, Ia = 0, Ba = 0, xa = 0, Ha = 0, Ua = 0, za = 0, Ya = 0, ja = 0, Va = 0, Wa = 0, qa = 0, Ka = 0, Xa = 0, Ga = 0, Ja = 0, Za = 0, Qa = 0, $a = 0, es = 0, rs = 0, ts = 0, ns = 0, os = 0, is = 0, as = 0, ss = 0, us = 0, ls = 0, cs = 0, ds = 0, fs = 0, ms = 0, Es = 0, Ss = 0, ps = 0, hs = 0, _s = 0, ws = 0, Fs = 0, gs = 0, vs = 0, ys = 0, Ms = 0, Rs = 0, Os = 0, As = 0, Ts = 0, bs = 0, Ns = 0, Ds = 0, ks = 0, Ps = 0, Cs = 0, Ls = 0, Is = 0, Bs = 0, xs = 0, Hs = 0, Us = 0, zs = 0, Ys = 0, js = 0, Vs = 0, Ws = 0, qs = 0, Ks = 0, Xs = 0, Gs = 0, Js = 0, Zs = 0, Qs = 0, $s = 0, eu = 0, ru = 0, tu = 0, nu = 0, ou = 0, iu = 0, au = 0, su = 0, uu = 0, lu = 0, cu = 0, du = 0, fu = 0, mu = 0, Eu = 0, Su = 0, pu = 0, hu = 0, _u = 0, wu = 0, Fu = 0, gu = 0, vu = 0, yu = 0, Mu = 0, Ru = 0, Ou = 0, Au = 0, Tu = 0, bu = 0, Nu = 0, Du = 0, ku = 0, Pu = 0, Cu = 0, Lu = 0, Iu = 0, Bu = 0, xu = 0, Hu = 0, Uu = 0, zu = 0, Yu = 0, ju = 0, Vu = 0, Wu = 0, qu = 0, Ku = 0, Xu = 0, Gu = 0, Ju = 0, Zu = 0, Qu = 0, $u = 0, el = 0, rl = 0, tl = 0;
            r = (e |= 0) >>> 0 < 245;
            do {
                if (r) {
                    if (Fn = (Pt = e >>> 0 < 11 ? 16 : -8 & (e + 11 | 0)) >>> 3,
                    0 != (0 | 3 & (ei = (so = 0 | nl[43]) >>> Fn))) {
                        ve = 212 + ((we = (Ee = (1 ^ 1 & ei) + Fn | 0) << 1) << 2) | 0,
                        Ce = 0 | nl[(Te = 212 + ((we + 2 | 0) << 2) | 0) >> 2],
                        Qe = (0 | ve) == (0 | (qe = 0 | nl[(He = Ce + 8 | 0) >> 2]));
                        do {
                            if (Qe)
                                ur = so & (-1 ^ 1 << Ee),
                                nl[43] = ur;
                            else {
                                if (qe >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                (0 | nl[(Rr = qe + 12 | 0) >> 2]) == (0 | Ce)) {
                                    nl[Rr >> 2] = ve,
                                    nl[Te >> 2] = qe;
                                    break
                                }
                                il()
                            }
                        } while (0);
                        return xr = 3 | (Lr = Ee << 3),
                        nl[(Ce + 4 | 0) >> 2] = xr,
                        rt = 1 | nl[(qr = Ce + (4 | Lr) | 0) >> 2],
                        nl[qr >> 2] = rt,
                        0 | (fu = He)
                    }
                    if ((it = 0 | nl[45]) >>> 0 < Pt >>> 0) {
                        if (0 != (0 | ei)) {
                            Lo = 212 + ((bo = (yo = ((hn = 8 & (dn = (Qt = ((Lt = ei << Fn & ((Rt = 2 << Fn) | 0 - Rt | 0)) & (0 - Lt | 0)) - 1 | 0) >>> (an = 16 & Qt >>> 12)) >>> 5) | an | (Cn = 4 & (yn = dn >>> hn) >>> 2) | (Kn = 2 & (Un = yn >>> Cn) >>> 1) | (fo = 1 & (to = Un >>> Kn) >>> 1)) + (to >>> fo) | 0) << 1) << 2) | 0,
                            Vo = 0 | nl[(Uo = 212 + ((bo + 2 | 0) << 2) | 0) >> 2],
                            ii = (0 | Lo) == (0 | (ri = 0 | nl[(Jo = Vo + 8 | 0) >> 2]));
                            do {
                                if (ii)
                                    _i = so & (-1 ^ 1 << yo),
                                    nl[43] = _i,
                                    ba = it;
                                else {
                                    if (ri >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                    (0 | nl[(ki = ri + 12 | 0) >> 2]) == (0 | Vo)) {
                                        nl[ki >> 2] = Lo,
                                        nl[Uo >> 2] = ri,
                                        ba = 0 | nl[45];
                                        break
                                    }
                                    il()
                                }
                            } while (0);
                            return ea = (Xi = yo << 3) - Pt | 0,
                            oa = 3 | Pt,
                            nl[(Vo + 4 | 0) >> 2] = oa,
                            ca = Vo + Pt | 0,
                            wa = 1 | ea,
                            nl[(Vo + (4 | Pt) | 0) >> 2] = wa,
                            nl[(Vo + Xi | 0) >> 2] = ea,
                            0 == (0 | ba) || (Ia = 0 | nl[48],
                            Xa = 212 + ((Va = (Ua = ba >>> 3) << 1) << 2) | 0,
                            0 == (0 | (Ja = 0 | nl[43]) & (ts = 1 << Ua)) ? (ws = Ja | ts,
                            nl[43] = ws,
                            k = 212 + ((Va + 2 | 0) << 2) | 0,
                            Ns = Xa) : (x = 0 | nl[(Ms = 212 + ((Va + 2 | 0) << 2) | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0 ? il() : (k = Ms,
                            Ns = x),
                            nl[k >> 2] = Ia,
                            nl[(Ns + 12 | 0) >> 2] = Ia,
                            nl[(Ia + 8 | 0) >> 2] = Ns,
                            nl[(Ia + 12 | 0) >> 2] = Xa),
                            nl[45] = ea,
                            nl[48] = ca,
                            0 | (fu = Jo)
                        }
                        if (0 != (0 | (re = 0 | nl[44]))) {
                            for (Fe = 0 | nl[(476 + ((((de = 8 & (ce = (ue = (re & (0 - re | 0)) - 1 | 0) >>> (le = 16 & ue >>> 12)) >>> 5) | le | (me = 4 & (fe = ce >>> de) >>> 2) | (pe = 2 & (Se = fe >>> me) >>> 1) | (_e = 1 & (he = Se >>> pe) >>> 1)) + (he >>> _e) | 0) << 2) | 0) >> 2],
                            hu = (-8 & (0 | nl[(Fe + 4 | 0) >> 2])) - Pt | 0,
                            Xu = Bu = Fe; ; ) {
                                if (0 == (0 | (ge = 0 | nl[(Bu + 16 | 0) >> 2]))) {
                                    if (0 == (0 | (ye = 0 | nl[(Bu + 20 | 0) >> 2]))) {
                                        _u = hu,
                                        Gu = Xu;
                                        break
                                    }
                                    Me = ye
                                } else
                                    Me = ge;
                                hu = (Oe = (Re = (-8 & (0 | nl[(Me + 4 | 0) >> 2])) - Pt | 0) >>> 0 < hu >>> 0) ? Re : hu,
                                Bu = Me,
                                Xu = Oe ? Me : Xu
                            }
                            Gu >>> 0 < (Ae = 0 | nl[47]) >>> 0 && il(),
                            Gu >>> 0 < (be = Gu + Pt | 0) >>> 0 || il(),
                            Ne = 0 | nl[(Gu + 24 | 0) >> 2],
                            ke = (0 | (De = 0 | nl[(Gu + 12 | 0) >> 2])) == (0 | Gu);
                            do {
                                if (ke) {
                                    if (0 == (0 | (xe = 0 | nl[(Be = Gu + 20 | 0) >> 2]))) {
                                        if (0 == (0 | (ze = 0 | nl[(Ue = Gu + 16 | 0) >> 2]))) {
                                            Ws = 0;
                                            break
                                        }
                                        Hs = ze,
                                        Xs = Ue
                                    } else
                                        Hs = xe,
                                        Xs = Be;
                                    for (; ; )
                                        if (0 == (0 | (je = 0 | nl[(Ye = Hs + 20 | 0) >> 2]))) {
                                            if (0 == (0 | (We = 0 | nl[(Ve = Hs + 16 | 0) >> 2]))) {
                                                Ys = Hs,
                                                Zs = Xs;
                                                break
                                            }
                                            Hs = We,
                                            Xs = Ve
                                        } else
                                            Hs = je,
                                            Xs = Ye;
                                    if (!(Zs >>> 0 < Ae >>> 0)) {
                                        nl[Zs >> 2] = 0,
                                        Ws = Ys;
                                        break
                                    }
                                    il()
                                } else {
                                    if ((Pe = 0 | nl[(Gu + 8 | 0) >> 2]) >>> 0 < Ae >>> 0 && il(),
                                    (0 | nl[(Le = Pe + 12 | 0) >> 2]) == (0 | Gu) || il(),
                                    (0 | nl[(Ie = De + 8 | 0) >> 2]) == (0 | Gu)) {
                                        nl[Le >> 2] = De,
                                        nl[Ie >> 2] = Pe,
                                        Ws = De;
                                        break
                                    }
                                    il()
                                }
                            } while (0);
                            Ke = 0 == (0 | Ne);
                            do {
                                if (!Ke) {
                                    if (Xe = 0 | nl[(Gu + 28 | 0) >> 2],
                                    (0 | Gu) == (0 | nl[(Ge = 476 + (Xe << 2) | 0) >> 2])) {
                                        if (0 == (0 | (nl[Ge >> 2] = Ws))) {
                                            Je = -1 ^ 1 << Xe,
                                            Ze = (0 | nl[44]) & Je,
                                            nl[44] = Ze;
                                            break
                                        }
                                    } else if (Ne >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                    (0 | nl[($e = Ne + 16 | 0) >> 2]) == (0 | Gu) ? nl[$e >> 2] = Ws : nl[(Ne + 20 | 0) >> 2] = Ws,
                                    0 == (0 | Ws))
                                        break;
                                    Ws >>> 0 < (er = 0 | nl[47]) >>> 0 && il(),
                                    nl[(Ws + 24 | 0) >> 2] = Ne,
                                    tr = 0 == (0 | (rr = 0 | nl[(Gu + 16 | 0) >> 2]));
                                    do {
                                        if (!tr) {
                                            if (!(rr >>> 0 < er >>> 0)) {
                                                nl[(Ws + 16 | 0) >> 2] = rr,
                                                nl[(rr + 24 | 0) >> 2] = Ws;
                                                break
                                            }
                                            il()
                                        }
                                    } while (0);
                                    if (0 != (0 | (nr = 0 | nl[(Gu + 20 | 0) >> 2]))) {
                                        if (!(nr >>> 0 < (0 | nl[47]) >>> 0)) {
                                            nl[(Ws + 20 | 0) >> 2] = nr,
                                            nl[(nr + 24 | 0) >> 2] = Ws;
                                            break
                                        }
                                        il()
                                    }
                                }
                            } while (0);
                            return _u >>> 0 < 16 ? (ir = 3 | (or = _u + Pt | 0),
                            nl[(Gu + 4 | 0) >> 2] = ir,
                            sr = 1 | nl[(ar = Gu + (or + 4 | 0) | 0) >> 2],
                            nl[ar >> 2] = sr) : (lr = 3 | Pt,
                            nl[(Gu + 4 | 0) >> 2] = lr,
                            cr = 1 | _u,
                            nl[(Gu + (4 | Pt) | 0) >> 2] = cr,
                            nl[(Gu + (_u + Pt | 0) | 0) >> 2] = _u,
                            0 == (0 | (dr = 0 | nl[45])) || (fr = 0 | nl[48],
                            Sr = 212 + ((Er = (mr = dr >>> 3) << 1) << 2) | 0,
                            0 == (0 | (pr = 0 | nl[43]) & (hr = 1 << mr)) ? (_r = pr | hr,
                            nl[43] = _r,
                            N = 212 + ((Er + 2 | 0) << 2) | 0,
                            bs = Sr) : (Fr = 0 | nl[(wr = 212 + ((Er + 2 | 0) << 2) | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0 ? il() : (N = wr,
                            bs = Fr),
                            nl[N >> 2] = fr,
                            nl[(bs + 12 | 0) >> 2] = fr,
                            nl[(fr + 8 | 0) >> 2] = bs,
                            nl[(fr + 12 | 0) >> 2] = Sr),
                            nl[45] = _u,
                            nl[48] = be),
                            0 | (fu = Gu + 8 | 0)
                        }
                        mu = Pt
                    } else
                        mu = Pt
                } else if (4294967231 < e >>> 0)
                    mu = -1;
                else if (vr = -8 & (gr = e + 11 | 0),
                0 == (0 | (yr = 0 | nl[44])))
                    mu = vr;
                else {
                    Mr = 0 - vr | 0,
                    du = 0 == (0 | (Or = gr >>> 8)) ? 0 : 16777215 < vr >>> 0 ? 31 : 1 & vr >>> (7 + (kr = (14 - ((br = 4 & (520192 + (Tr = Or << (Ar = 8 & (Or + 1048320 | 0) >>> 16)) | 0) >>> 16) | Ar | (Dr = 2 & (245760 + (Nr = Tr << br) | 0) >>> 16)) | 0) + (Nr << Dr >>> 15) | 0) | 0) | kr << 1,
                    Cr = 0 == (0 | (Pr = 0 | nl[(476 + (du << 2) | 0) >> 2]));
                    e: do {
                        if (Cr)
                            gu = Mr,
                            Qu = Hu = 0,
                            tl = 86;
                        else
                            for (wu = Mr,
                            Ou = vr << (31 == (0 | du) ? 0 : 25 - (du >>> 1) | 0),
                            xu = Pr,
                            Ju = Mu = 0; ; ) {
                                if ((Br = (Ir = -8 & (0 | nl[(xu + 4 | 0) >> 2])) - vr | 0) >>> 0 < wu >>> 0) {
                                    if ((0 | Ir) == (0 | vr)) {
                                        yu = Br,
                                        rl = Yu = xu,
                                        tl = 90;
                                        break e
                                    }
                                    Fu = Br,
                                    Zu = xu
                                } else
                                    Fu = wu,
                                    Zu = Ju;
                                if (Ru = 0 == (0 | (Hr = 0 | nl[(xu + 20 | 0) >> 2])) | (0 | Hr) == (0 | (Ur = 0 | nl[((xu + 16 | 0) + (Ou >>> 31 << 2) | 0) >> 2])) ? Mu : Hr,
                                zr = Ou << 1,
                                0 == (0 | Ur)) {
                                    gu = Fu,
                                    Hu = Ru,
                                    Qu = Zu,
                                    tl = 86;
                                    break
                                }
                                wu = Fu,
                                Mu = Ru,
                                Ou = zr,
                                xu = Ur,
                                Ju = Zu
                            }
                    } while (0);
                    if (86 == (0 | tl)) {
                        if (0 == (0 | Hu) & 0 == (0 | Qu)) {
                            if (0 == (0 | (jr = yr & ((Yr = 2 << du) | 0 - Yr | 0)))) {
                                mu = vr;
                                break
                            }
                            Uu = 0 | nl[(476 + ((((Xr = 8 & (Kr = (Vr = (jr & (0 - jr | 0)) - 1 | 0) >>> (Wr = 16 & Vr >>> 12)) >>> 5) | Wr | (Jr = 4 & (Gr = Kr >>> Xr) >>> 2) | (Qr = 2 & (Zr = Gr >>> Jr) >>> 1) | (et = 1 & ($r = Zr >>> Qr) >>> 1)) + ($r >>> et) | 0) << 2) | 0) >> 2],
                            el = 0
                        } else
                            Uu = Hu,
                            el = Qu;
                        0 == (0 | Uu) ? (vu = gu,
                        $u = el) : (yu = gu,
                        Yu = Uu,
                        rl = el,
                        tl = 90)
                    }
                    if (90 == (0 | tl))
                        for (; ; )
                            if (P = (nt = (tt = (-8 & ((tl = 0) | nl[(Yu + 4 | 0) >> 2])) - vr | 0) >>> 0 < yu >>> 0) ? tt : yu,
                            zu = nt ? Yu : rl,
                            0 == (0 | (ot = 0 | nl[(Yu + 16 | 0) >> 2]))) {
                                if (0 == (0 | (at = 0 | nl[(Yu + 20 | 0) >> 2]))) {
                                    vu = P,
                                    $u = zu;
                                    break
                                }
                                yu = P,
                                Yu = at,
                                rl = zu,
                                tl = 90
                            } else
                                yu = P,
                                Yu = ot,
                                rl = zu,
                                tl = 90;
                    if (0 == (0 | $u))
                        mu = vr;
                    else {
                        if (vu >>> 0 < ((0 | nl[45]) - vr | 0) >>> 0) {
                            $u >>> 0 < (st = 0 | nl[47]) >>> 0 && il(),
                            $u >>> 0 < (ut = $u + vr | 0) >>> 0 || il(),
                            lt = 0 | nl[($u + 24 | 0) >> 2],
                            dt = (0 | (ct = 0 | nl[($u + 12 | 0) >> 2])) == (0 | $u);
                            do {
                                if (dt) {
                                    if (0 == (0 | (pt = 0 | nl[(St = $u + 20 | 0) >> 2]))) {
                                        if (0 == (0 | (_t = 0 | nl[(ht = $u + 16 | 0) >> 2]))) {
                                            Ks = 0;
                                            break
                                        }
                                        js = _t,
                                        Qs = ht
                                    } else
                                        js = pt,
                                        Qs = St;
                                    for (; ; )
                                        if (0 == (0 | (Ft = 0 | nl[(wt = js + 20 | 0) >> 2]))) {
                                            if (0 == (0 | (vt = 0 | nl[(gt = js + 16 | 0) >> 2]))) {
                                                Vs = js,
                                                $s = Qs;
                                                break
                                            }
                                            js = vt,
                                            Qs = gt
                                        } else
                                            js = Ft,
                                            Qs = wt;
                                    if (!($s >>> 0 < st >>> 0)) {
                                        nl[$s >> 2] = 0,
                                        Ks = Vs;
                                        break
                                    }
                                    il()
                                } else {
                                    if ((ft = 0 | nl[($u + 8 | 0) >> 2]) >>> 0 < st >>> 0 && il(),
                                    (0 | nl[(mt = ft + 12 | 0) >> 2]) == (0 | $u) || il(),
                                    (0 | nl[(Et = ct + 8 | 0) >> 2]) == (0 | $u)) {
                                        nl[mt >> 2] = ct,
                                        nl[Et >> 2] = ft,
                                        Ks = ct;
                                        break
                                    }
                                    il()
                                }
                            } while (0);
                            yt = 0 == (0 | lt);
                            do {
                                if (!yt) {
                                    if (Mt = 0 | nl[($u + 28 | 0) >> 2],
                                    (0 | $u) == (0 | nl[(Ot = 476 + (Mt << 2) | 0) >> 2])) {
                                        if (0 == (0 | (nl[Ot >> 2] = Ks))) {
                                            At = -1 ^ 1 << Mt,
                                            Tt = (0 | nl[44]) & At,
                                            nl[44] = Tt;
                                            break
                                        }
                                    } else if (lt >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                    (0 | nl[(bt = lt + 16 | 0) >> 2]) == (0 | $u) ? nl[bt >> 2] = Ks : nl[(lt + 20 | 0) >> 2] = Ks,
                                    0 == (0 | Ks))
                                        break;
                                    Ks >>> 0 < (Nt = 0 | nl[47]) >>> 0 && il(),
                                    nl[(Ks + 24 | 0) >> 2] = lt,
                                    kt = 0 == (0 | (Dt = 0 | nl[($u + 16 | 0) >> 2]));
                                    do {
                                        if (!kt) {
                                            if (!(Dt >>> 0 < Nt >>> 0)) {
                                                nl[(Ks + 16 | 0) >> 2] = Dt,
                                                nl[(Dt + 24 | 0) >> 2] = Ks;
                                                break
                                            }
                                            il()
                                        }
                                    } while (0);
                                    if (0 != (0 | (Ct = 0 | nl[($u + 20 | 0) >> 2]))) {
                                        if (!(Ct >>> 0 < (0 | nl[47]) >>> 0)) {
                                            nl[(Ks + 20 | 0) >> 2] = Ct,
                                            nl[(Ct + 24 | 0) >> 2] = Ks;
                                            break
                                        }
                                        il()
                                    }
                                }
                            } while (0);
                            It = vu >>> 0 < 16;
                            e: do {
                                if (It)
                                    xt = 3 | (Bt = vu + vr | 0),
                                    nl[($u + 4 | 0) >> 2] = xt,
                                    Ut = 1 | nl[(Ht = $u + (Bt + 4 | 0) | 0) >> 2],
                                    nl[Ht >> 2] = Ut;
                                else {
                                    if (zt = 3 | vr,
                                    nl[($u + 4 | 0) >> 2] = zt,
                                    Yt = 1 | vu,
                                    nl[($u + (4 | vr) | 0) >> 2] = Yt,
                                    jt = (nl[($u + (vu + vr | 0) | 0) >> 2] = vu) >>> 3,
                                    vu >>> 0 < 256) {
                                        Wt = 212 + ((Vt = jt << 1) << 2) | 0,
                                        0 == (0 | (qt = 0 | nl[43]) & (Kt = 1 << jt)) ? (Xt = qt | Kt,
                                        nl[43] = Xt,
                                        b = 212 + ((Vt + 2 | 0) << 2) | 0,
                                        ks = Wt) : (Jt = 0 | nl[(Gt = 212 + ((Vt + 2 | 0) << 2) | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0 ? il() : (b = Gt,
                                        ks = Jt),
                                        nl[b >> 2] = ut,
                                        nl[(ks + 12 | 0) >> 2] = ut,
                                        nl[($u + (vr + 8 | 0) | 0) >> 2] = ks,
                                        nl[($u + (vr + 12 | 0) | 0) >> 2] = Wt;
                                        break
                                    }
                                    if (sn = 476 + ((Cs = 0 == (0 | (Zt = vu >>> 8)) ? 0 : 16777215 < vu >>> 0 ? 31 : 1 & vu >>> (7 + (on = (14 - ((rn = 4 & (520192 + (en = Zt << ($t = 8 & (Zt + 1048320 | 0) >>> 16)) | 0) >>> 16) | $t | (nn = 2 & (245760 + (tn = en << rn) | 0) >>> 16)) | 0) + (tn << nn >>> 15) | 0) | 0) | on << 1) << 2) | 0,
                                    nl[($u + (vr + 28 | 0) | 0) >> 2] = Cs,
                                    un = $u + (vr + 16 | 0) | 0,
                                    nl[($u + (vr + 20 | 0) | 0) >> 2] = 0,
                                    (nl[un >> 2] = 0) == (0 | (ln = 0 | nl[44]) & (cn = 1 << Cs))) {
                                        fn = ln | cn,
                                        nl[44] = fn,
                                        nl[sn >> 2] = ut,
                                        nl[($u + (vr + 24 | 0) | 0) >> 2] = sn,
                                        nl[($u + (vr + 12 | 0) | 0) >> 2] = ut,
                                        nl[($u + (vr + 8 | 0) | 0) >> 2] = ut;
                                        break
                                    }
                                    mn = 0 | nl[sn >> 2],
                                    En = (0 | -8 & (0 | nl[(mn + 4 | 0) >> 2])) == (0 | vu);
                                    r: do {
                                        if (En)
                                            eu = mn;
                                        else {
                                            for (Is = vu << (31 == (0 | Cs) ? 0 : 25 - (Cs >>> 1) | 0),
                                            nu = mn; ; ) {
                                                if (0 == (0 | (pn = 0 | nl[(_n = (nu + 16 | 0) + (Is >>> 31 << 2) | 0) >> 2]))) {
                                                    O = _n,
                                                    ou = nu;
                                                    break
                                                }
                                                if (Sn = Is << 1,
                                                (0 | -8 & (0 | nl[(pn + 4 | 0) >> 2])) == (0 | vu)) {
                                                    eu = pn;
                                                    break r
                                                }
                                                Is = Sn,
                                                nu = pn
                                            }
                                            if (!(O >>> 0 < (0 | nl[47]) >>> 0)) {
                                                nl[O >> 2] = ut,
                                                nl[($u + (vr + 24 | 0) | 0) >> 2] = ou,
                                                nl[($u + (vr + 12 | 0) | 0) >> 2] = ut,
                                                nl[($u + (vr + 8 | 0) | 0) >> 2] = ut;
                                                break e
                                            }
                                            il()
                                        }
                                    } while (0);
                                    if (gn = 0 | nl[(wn = eu + 8 | 0) >> 2],
                                    (vn = 0 | nl[47]) >>> 0 <= gn >>> 0 & vn >>> 0 <= eu >>> 0) {
                                        nl[(gn + 12 | 0) >> 2] = ut,
                                        nl[wn >> 2] = ut,
                                        nl[($u + (vr + 8 | 0) | 0) >> 2] = gn,
                                        nl[($u + (vr + 12 | 0) | 0) >> 2] = eu,
                                        nl[($u + (vr + 24 | 0) | 0) >> 2] = 0;
                                        break
                                    }
                                    il()
                                }
                            } while (0);
                            return 0 | (fu = $u + 8 | 0)
                        }
                        mu = vr
                    }
                }
            } while (0);
            if (!((n = 0 | nl[45]) >>> 0 < mu >>> 0))
                return Mn = n - mu | 0,
                Rn = 0 | nl[48],
                15 < Mn >>> 0 ? (On = Rn + mu | 0,
                nl[48] = On,
                An = 1 | (nl[45] = Mn),
                nl[(Rn + (mu + 4 | 0) | 0) >> 2] = An,
                nl[(Rn + n | 0) >> 2] = Mn,
                Tn = 3 | mu,
                nl[(Rn + 4 | 0) >> 2] = Tn) : (nl[45] = 0,
                nl[48] = 0,
                bn = 3 | n,
                nl[(Rn + 4 | 0) >> 2] = bn,
                Dn = 1 | nl[(Nn = Rn + (n + 4 | 0) | 0) >> 2],
                nl[Nn >> 2] = Dn),
                0 | (fu = Rn + 8 | 0);
            if (mu >>> 0 < (o = 0 | nl[46]) >>> 0)
                return kn = o - mu | 0,
                nl[46] = kn,
                Ln = (Pn = 0 | nl[49]) + mu | 0,
                nl[49] = Ln,
                In = 1 | kn,
                nl[(Pn + (mu + 4 | 0) | 0) >> 2] = In,
                Bn = 3 | mu,
                nl[(Pn + 4 | 0) >> 2] = Bn,
                0 | (fu = Pn + 8 | 0);
            i = 0 == (0 | nl[161]);
            do {
                if (i) {
                    if (0 == (0 | ((xn = 0 | ol(30)) - 1 | 0) & xn)) {
                        nl[163] = xn,
                        nl[162] = xn,
                        nl[164] = -1,
                        nl[165] = -1,
                        nl[166] = 0,
                        Hn = 1431655768 ^ -16 & ((nl[154] = 0) | sl(0)),
                        nl[161] = Hn;
                        break
                    }
                    il()
                }
            } while (0);
            if (a = mu + 48 | 0,
            !(mu >>> 0 < (d = (l = (s = 0 | nl[163]) + (u = mu + 47 | 0) | 0) & (c = 0 - s | 0)) >>> 0))
                return (fu = 0) | fu;
            if (0 != (0 | (f = 0 | nl[153])) && (Yn = (zn = 0 | nl[151]) + d | 0) >>> 0 <= zn >>> 0 | f >>> 0 < Yn >>> 0)
                return (fu = 0) | fu;
            m = 0 == (0 | 4 & (0 | nl[154]));
            e: do {
                if (m) {
                    Vn = 0 == (0 | (jn = 0 | nl[49]));
                    r: do {
                        if (Vn)
                            tl = 174;
                        else {
                            for (Au = 620; ; ) {
                                if (!(jn >>> 0 < (Wn = 0 | nl[Au >> 2]) >>> 0) && jn >>> 0 < (Wn + (0 | nl[(qn = Au + 4 | 0) >> 2]) | 0) >>> 0) {
                                    M = Au,
                                    R = qn;
                                    break
                                }
                                if (0 == (0 | (Xn = 0 | nl[(Au + 8 | 0) >> 2]))) {
                                    tl = 174;
                                    break r
                                }
                                Au = Xn
                            }
                            if ((io = (l - (0 | nl[46]) | 0) & c) >>> 0 < 2147483647)
                                if (E = (uo = (0 | (ao = 0 | al(0 | io))) == (0 | (0 | nl[M >> 2]) + (0 | nl[R >> 2]))) ? io : 0,
                                uo) {
                                    if (-1 != (0 | ao)) {
                                        ju = ao,
                                        Ku = E,
                                        tl = 194;
                                        break e
                                    }
                                    Wu = E
                                } else
                                    lu = ao,
                                    Lu = io,
                                    Vu = E,
                                    tl = 184;
                            else
                                Wu = 0
                        }
                    } while (0);
                    do {
                        if (174 == (0 | tl))
                            if (-1 == (0 | (Gn = 0 | al(0))))
                                Wu = 0;
                            else if (Jn = Gn,
                            Cu = 0 == (0 | (Qn = (Zn = 0 | nl[162]) - 1 | 0) & Jn) ? d : (d - Jn | 0) + ((Qn + Jn | 0) & (0 - Zn | 0)) | 0,
                            eo = ($n = 0 | nl[151]) + Cu | 0,
                            mu >>> 0 < Cu >>> 0 & Cu >>> 0 < 2147483647) {
                                if (0 != (0 | (ro = 0 | nl[153])) && eo >>> 0 <= $n >>> 0 | ro >>> 0 < eo >>> 0) {
                                    Wu = 0;
                                    break
                                }
                                if (Pu = (oo = (0 | (no = 0 | al(0 | Cu))) == (0 | Gn)) ? Cu : 0,
                                oo) {
                                    ju = Gn,
                                    Ku = Pu,
                                    tl = 194;
                                    break e
                                }
                                lu = no,
                                Lu = Cu,
                                Vu = Pu,
                                tl = 184
                            } else
                                Wu = 0
                    } while (0);
                    r: do {
                        if (184 == (0 | tl)) {
                            lo = 0 - Lu | 0,
                            Su = Lu >>> 0 < a >>> 0 & Lu >>> 0 < 2147483647 & -1 != (0 | lu);
                            do {
                                if (Su) {
                                    if ((mo = ((u - Lu | 0) + (co = 0 | nl[163]) | 0) & (0 - co | 0)) >>> 0 < 2147483647) {
                                        if (-1 == (0 | al(0 | mo))) {
                                            al(0 | lo),
                                            Wu = Vu;
                                            break r
                                        }
                                        Iu = mo + Lu | 0;
                                        break
                                    }
                                    Iu = Lu
                                } else
                                    Iu = Lu
                            } while (0);
                            if (-1 != (0 | lu)) {
                                ju = lu,
                                Ku = Iu,
                                tl = 194;
                                break e
                            }
                            Wu = Vu
                        }
                    } while (0);
                    Eo = 4 | nl[154],
                    nl[154] = Eo,
                    qu = Wu,
                    tl = 191
                } else
                    qu = 0,
                    tl = 191
            } while (0);
            if (191 == (0 | tl) && d >>> 0 < 2147483647 && (So = 0 | al(0 | d)) >>> 0 < (po = 0 | al(0)) >>> 0 & -1 != (0 | So) & -1 != (0 | po) && (_o = (mu + 40 | 0) >>> 0 < (ho = po - So | 0) >>> 0) && (ju = So,
            Ku = _o ? ho : qu,
            tl = 194),
            194 == (0 | tl)) {
                wo = (0 | nl[151]) + Ku | 0,
                nl[151] = wo,
                (0 | nl[152]) >>> 0 < wo >>> 0 && (nl[152] = wo),
                go = 0 == (0 | (Fo = 0 | nl[49]));
                e: do {
                    if (go) {
                        for (0 == (0 | (vo = 0 | nl[47])) | ju >>> 0 < vo >>> 0 && (nl[47] = ju),
                        nl[155] = ju,
                        nl[156] = Ku,
                        Mo = (nl[158] = 0) | nl[161],
                        nl[52] = Mo,
                        nl[51] = -1,
                        cu = 0; Oo = 212 + ((Ro = cu << 1) << 2) | 0,
                        nl[(212 + ((Ro + 3 | 0) << 2) | 0) >> 2] = Oo,
                        nl[(212 + ((Ro + 2 | 0) << 2) | 0) >> 2] = Oo,
                        32 != (0 | (Ao = cu + 1 | 0)); )
                            cu = Ao;
                        Do = ju + (No = 0 == (0 | 7 & (To = ju + 8 | 0)) ? 0 : 7 & (0 - To | 0)) | 0,
                        ko = (Ku + -40 | 0) - No | 0,
                        nl[49] = Do,
                        Po = 1 | (nl[46] = ko),
                        nl[(ju + (No + 4 | 0) | 0) >> 2] = Po,
                        nl[(ju + (Ku + -36 | 0) | 0) >> 2] = 40,
                        Co = 0 | nl[165],
                        nl[50] = Co
                    } else {
                        for (bu = 620; ; ) {
                            if ((0 | ju) == (0 | (Io = 0 | nl[bu >> 2]) + (xo = 0 | nl[(Bo = bu + 4 | 0) >> 2]))) {
                                g = Io,
                                v = Bo,
                                y = xo,
                                Nu = bu,
                                tl = 204;
                                break
                            }
                            if (0 == (0 | (Ho = 0 | nl[(bu + 8 | 0) >> 2])))
                                break;
                            bu = Ho
                        }
                        if (204 == (0 | tl) && 0 == (0 | 8 & (0 | nl[(Nu + 12 | 0) >> 2])) && Fo >>> 0 < ju >>> 0 & g >>> 0 <= Fo >>> 0) {
                            zo = y + Ku | 0,
                            nl[v >> 2] = zo,
                            qo = Fo + (Wo = 0 == (0 | 7 & (jo = Fo + 8 | 0)) ? 0 : 7 & (0 - jo | 0)) | 0,
                            Ko = (Yo = (0 | nl[46]) + Ku | 0) - Wo | 0,
                            nl[49] = qo,
                            Xo = 1 | (nl[46] = Ko),
                            nl[(Fo + (Wo + 4 | 0) | 0) >> 2] = Xo,
                            nl[(Fo + (Yo + 4 | 0) | 0) >> 2] = 40,
                            Go = 0 | nl[165],
                            nl[50] = Go;
                            break
                        }
                        for (Ai = ju >>> 0 < (Zo = 0 | nl[47]) >>> 0 ? nl[47] = ju : Zo,
                        Qo = ju + Ku | 0,
                        Du = 620; ; ) {
                            if ((0 | nl[Du >> 2]) == (0 | Qo)) {
                                ku = F = Du,
                                tl = 212;
                                break
                            }
                            if (0 == (0 | ($o = 0 | nl[(Du + 8 | 0) >> 2]))) {
                                Tu = 620;
                                break
                            }
                            Du = $o
                        }
                        if (212 == (0 | tl)) {
                            if (0 == (0 | 8 & (0 | nl[(ku + 12 | 0) >> 2]))) {
                                nl[F >> 2] = ju,
                                ni = (0 | nl[(ti = ku + 4 | 0) >> 2]) + Ku | 0,
                                nl[ti >> 2] = ni,
                                ci = ju + (C = (ai = 0 == (0 | 7 & (oi = ju + 8 | 0)) ? 0 : 7 & (0 - oi | 0)) + mu | 0) | 0,
                                di = ((li = ju + ((ui = 0 == (0 | 7 & (si = ju + (Ku + 8 | 0) | 0)) ? 0 : 7 & (0 - si | 0)) + Ku | 0) | 0) - (ju + ai | 0) | 0) - mu | 0,
                                fi = 3 | mu,
                                nl[(ju + (ai + 4 | 0) | 0) >> 2] = fi,
                                mi = (0 | li) == (0 | Fo);
                                r: do {
                                    if (mi)
                                        Ei = (0 | nl[46]) + di | 0,
                                        nl[46] = Ei,
                                        nl[49] = ci,
                                        Si = 1 | Ei,
                                        nl[(ju + (C + 4 | 0) | 0) >> 2] = Si;
                                    else {
                                        if ((0 | li) == (0 | nl[48])) {
                                            pi = (0 | nl[45]) + di | 0,
                                            nl[45] = pi,
                                            nl[48] = ci,
                                            hi = 1 | pi,
                                            nl[(ju + (C + 4 | 0) | 0) >> 2] = hi,
                                            nl[(ju + (pi + C | 0) | 0) >> 2] = pi;
                                            break
                                        }
                                        if (1 == (0 | 3 & (wi = 0 | nl[(ju + ((L = Ku + 4 | 0) + ui | 0) | 0) >> 2]))) {
                                            Fi = -8 & wi,
                                            gi = wi >>> 3,
                                            vi = wi >>> 0 < 256;
                                            t: do {
                                                if (vi) {
                                                    yi = 0 | nl[(ju + ((8 | ui) + Ku | 0) | 0) >> 2],
                                                    Mi = 0 | nl[(ju + ((Ku + 12 | 0) + ui | 0) | 0) >> 2],
                                                    Oi = (0 | yi) == (0 | (Ri = 212 + (gi << 1 << 2) | 0));
                                                    do {
                                                        if (!Oi) {
                                                            if (yi >>> 0 < Ai >>> 0 && il(),
                                                            (0 | nl[(yi + 12 | 0) >> 2]) == (0 | li))
                                                                break;
                                                            il()
                                                        }
                                                    } while (0);
                                                    if ((0 | Mi) == (0 | yi)) {
                                                        Ti = -1 ^ 1 << gi,
                                                        bi = (0 | nl[43]) & Ti,
                                                        nl[43] = bi;
                                                        break
                                                    }
                                                    Ni = (0 | Mi) == (0 | Ri);
                                                    do {
                                                        if (Ni)
                                                            D = Mi + 8 | 0;
                                                        else {
                                                            if (Mi >>> 0 < Ai >>> 0 && il(),
                                                            (0 | nl[(Di = Mi + 8 | 0) >> 2]) == (0 | li)) {
                                                                D = Di;
                                                                break
                                                            }
                                                            il()
                                                        }
                                                    } while (0);
                                                    nl[(yi + 12 | 0) >> 2] = Mi,
                                                    nl[D >> 2] = yi
                                                } else {
                                                    Pi = 0 | nl[(ju + ((24 | ui) + Ku | 0) | 0) >> 2],
                                                    Li = (0 | (Ci = 0 | nl[(ju + ((Ku + 12 | 0) + ui | 0) | 0) >> 2])) == (0 | li);
                                                    do {
                                                        if (Li) {
                                                            if (0 == (0 | (Ui = 0 | nl[(Hi = ju + (L + (B = 16 | ui) | 0) | 0) >> 2]))) {
                                                                if (0 == (0 | (Yi = 0 | nl[(zi = ju + (B + Ku | 0) | 0) >> 2]))) {
                                                                    qs = 0;
                                                                    break
                                                                }
                                                                Us = Yi,
                                                                Gs = zi
                                                            } else
                                                                Us = Ui,
                                                                Gs = Hi;
                                                            for (; ; )
                                                                if (0 == (0 | (Vi = 0 | nl[(ji = Us + 20 | 0) >> 2]))) {
                                                                    if (0 == (0 | (qi = 0 | nl[(Wi = Us + 16 | 0) >> 2]))) {
                                                                        zs = Us,
                                                                        Js = Gs;
                                                                        break
                                                                    }
                                                                    Us = qi,
                                                                    Gs = Wi
                                                                } else
                                                                    Us = Vi,
                                                                    Gs = ji;
                                                            if (!(Js >>> 0 < Ai >>> 0)) {
                                                                nl[Js >> 2] = 0,
                                                                qs = zs;
                                                                break
                                                            }
                                                            il()
                                                        } else {
                                                            if ((Ii = 0 | nl[(ju + ((8 | ui) + Ku | 0) | 0) >> 2]) >>> 0 < Ai >>> 0 && il(),
                                                            (0 | nl[(Bi = Ii + 12 | 0) >> 2]) == (0 | li) || il(),
                                                            (0 | nl[(xi = Ci + 8 | 0) >> 2]) == (0 | li)) {
                                                                nl[Bi >> 2] = Ci,
                                                                nl[xi >> 2] = Ii,
                                                                qs = Ci;
                                                                break
                                                            }
                                                            il()
                                                        }
                                                    } while (0);
                                                    if (0 == (0 | Pi))
                                                        break;
                                                    Ki = 0 | nl[(ju + ((Ku + 28 | 0) + ui | 0) | 0) >> 2],
                                                    Ji = (0 | li) == (0 | nl[(Gi = 476 + (Ki << 2) | 0) >> 2]);
                                                    do {
                                                        if (Ji) {
                                                            if (0 != (0 | (nl[Gi >> 2] = qs)))
                                                                break;
                                                            Zi = -1 ^ 1 << Ki,
                                                            Qi = (0 | nl[44]) & Zi,
                                                            nl[44] = Qi;
                                                            break t
                                                        }
                                                        if (Pi >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                                        (0 | nl[($i = Pi + 16 | 0) >> 2]) == (0 | li) ? nl[$i >> 2] = qs : nl[(Pi + 20 | 0) >> 2] = qs,
                                                        0 == (0 | qs))
                                                            break t
                                                    } while (0);
                                                    qs >>> 0 < (ra = 0 | nl[47]) >>> 0 && il(),
                                                    nl[(qs + 24 | 0) >> 2] = Pi,
                                                    na = 0 == (0 | (ta = 0 | nl[(ju + ((I = 16 | ui) + Ku | 0) | 0) >> 2]));
                                                    do {
                                                        if (!na) {
                                                            if (!(ta >>> 0 < ra >>> 0)) {
                                                                nl[(qs + 16 | 0) >> 2] = ta,
                                                                nl[(ta + 24 | 0) >> 2] = qs;
                                                                break
                                                            }
                                                            il()
                                                        }
                                                    } while (0);
                                                    if (0 == (0 | (ia = 0 | nl[(ju + (L + I | 0) | 0) >> 2])))
                                                        break;
                                                    if (!(ia >>> 0 < (0 | nl[47]) >>> 0)) {
                                                        nl[(qs + 20 | 0) >> 2] = ia,
                                                        nl[(ia + 24 | 0) >> 2] = qs;
                                                        break
                                                    }
                                                    il()
                                                }
                                            } while (0);
                                            Eu = ju + ((Fi | ui) + Ku | 0) | 0,
                                            pu = Fi + di | 0
                                        } else
                                            Eu = li,
                                            pu = di;
                                        if (sa = -2 & (0 | nl[(aa = Eu + 4 | 0) >> 2]),
                                        nl[aa >> 2] = sa,
                                        ua = 1 | pu,
                                        nl[(ju + (C + 4 | 0) | 0) >> 2] = ua,
                                        la = (nl[(ju + (pu + C | 0) | 0) >> 2] = pu) >>> 3,
                                        pu >>> 0 < 256) {
                                            fa = 212 + ((da = la << 1) << 2) | 0,
                                            Sa = 0 == (0 | (ma = 0 | nl[43]) & (Ea = 1 << la));
                                            do {
                                                if (Sa)
                                                    pa = ma | Ea,
                                                    nl[43] = pa,
                                                    T = 212 + ((da + 2 | 0) << 2) | 0,
                                                    Ds = fa;
                                                else {
                                                    if (!((_a = 0 | nl[(ha = 212 + ((da + 2 | 0) << 2) | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0)) {
                                                        T = ha,
                                                        Ds = _a;
                                                        break
                                                    }
                                                    il()
                                                }
                                            } while (0);
                                            nl[T >> 2] = ci,
                                            nl[(Ds + 12 | 0) >> 2] = ci,
                                            nl[(ju + (C + 8 | 0) | 0) >> 2] = Ds,
                                            nl[(ju + (C + 12 | 0) | 0) >> 2] = fa;
                                            break
                                        }
                                        ga = 0 == (0 | (Fa = pu >>> 8));
                                        do {
                                            if (ga)
                                                Ls = 0;
                                            else {
                                                if (16777215 < pu >>> 0) {
                                                    Ls = 31;
                                                    break
                                                }
                                                Ls = 1 & pu >>> (7 + (Aa = (14 - ((Ma = 4 & (520192 + (ya = Fa << (va = 8 & (Fa + 1048320 | 0) >>> 16)) | 0) >>> 16) | va | (Oa = 2 & (245760 + (Ra = ya << Ma) | 0) >>> 16)) | 0) + (Ra << Oa >>> 15) | 0) | 0) | Aa << 1
                                            }
                                        } while (0);
                                        if (Ta = 476 + (Ls << 2) | 0,
                                        nl[(ju + (C + 28 | 0) | 0) >> 2] = Ls,
                                        Na = ju + (C + 16 | 0) | 0,
                                        nl[(ju + (C + 20 | 0) | 0) >> 2] = 0,
                                        (nl[Na >> 2] = 0) == (0 | (Da = 0 | nl[44]) & (ka = 1 << Ls))) {
                                            Pa = Da | ka,
                                            nl[44] = Pa,
                                            nl[Ta >> 2] = ci,
                                            nl[(ju + (C + 24 | 0) | 0) >> 2] = Ta,
                                            nl[(ju + (C + 12 | 0) | 0) >> 2] = ci,
                                            nl[(ju + (C + 8 | 0) | 0) >> 2] = ci;
                                            break
                                        }
                                        Ca = 0 | nl[Ta >> 2],
                                        La = (0 | -8 & (0 | nl[(Ca + 4 | 0) >> 2])) == (0 | pu);
                                        t: do {
                                            if (La)
                                                tu = Ca;
                                            else {
                                                for (xs = pu << (31 == (0 | Ls) ? 0 : 25 - (Ls >>> 1) | 0),
                                                iu = Ca; ; ) {
                                                    if (0 == (0 | (xa = 0 | nl[(Ha = (iu + 16 | 0) + (xs >>> 31 << 2) | 0) >> 2]))) {
                                                        S = Ha,
                                                        au = iu;
                                                        break
                                                    }
                                                    if (Ba = xs << 1,
                                                    (0 | -8 & (0 | nl[(xa + 4 | 0) >> 2])) == (0 | pu)) {
                                                        tu = xa;
                                                        break t
                                                    }
                                                    xs = Ba,
                                                    iu = xa
                                                }
                                                if (!(S >>> 0 < (0 | nl[47]) >>> 0)) {
                                                    nl[S >> 2] = ci,
                                                    nl[(ju + (C + 24 | 0) | 0) >> 2] = au,
                                                    nl[(ju + (C + 12 | 0) | 0) >> 2] = ci,
                                                    nl[(ju + (C + 8 | 0) | 0) >> 2] = ci;
                                                    break r
                                                }
                                                il()
                                            }
                                        } while (0);
                                        if (Ya = 0 | nl[(za = tu + 8 | 0) >> 2],
                                        (ja = 0 | nl[47]) >>> 0 <= Ya >>> 0 & ja >>> 0 <= tu >>> 0) {
                                            nl[(Ya + 12 | 0) >> 2] = ci,
                                            nl[za >> 2] = ci,
                                            nl[(ju + (C + 8 | 0) | 0) >> 2] = Ya,
                                            nl[(ju + (C + 12 | 0) | 0) >> 2] = tu,
                                            nl[(ju + (C + 24 | 0) | 0) >> 2] = 0;
                                            break
                                        }
                                        il()
                                    }
                                } while (0);
                                return 0 | (fu = ju + (8 | ai) | 0)
                            }
                            Tu = 620
                        }
                        for (; ; ) {
                            if (!(Fo >>> 0 < (Wa = 0 | nl[Tu >> 2]) >>> 0) && Fo >>> 0 < (Ka = Wa + (qa = 0 | nl[(Tu + 4 | 0) >> 2]) | 0) >>> 0) {
                                h = Wa,
                                _ = qa,
                                w = Ka;
                                break
                            }
                            Tu = 0 | nl[(Tu + 8 | 0) >> 2]
                        }
                        if (es = ($a = (Za = h + ((_ + -47 | 0) + (0 == (0 | 7 & (Ga = h + (_ + -39 | 0) | 0)) ? 0 : 7 & (0 - Ga | 0)) | 0) | 0) >>> 0 < (Qa = Fo + 16 | 0) >>> 0 ? Fo : Za) + 8 | 0,
                        os = ju + (ns = 0 == (0 | 7 & (rs = ju + 8 | 0)) ? 0 : 7 & (0 - rs | 0)) | 0,
                        is = (Ku + -40 | 0) - ns | 0,
                        nl[49] = os,
                        as = 1 | (nl[46] = is),
                        nl[(ju + (ns + 4 | 0) | 0) >> 2] = as,
                        nl[(ju + (Ku + -36 | 0) | 0) >> 2] = 40,
                        ss = 0 | nl[165],
                        nl[50] = ss,
                        nl[(us = $a + 4 | 0) >> 2] = 27,
                        nl[es >> 2] = 0 | nl[155],
                        nl[es + 4 >> 2] = 0 | nl[156],
                        nl[es + 8 >> 2] = 0 | nl[157],
                        nl[es + 12 >> 2] = 0 | nl[158],
                        nl[155] = ju,
                        nl[156] = Ku,
                        nl[158] = 0,
                        nl[157] = es,
                        nl[(ls = $a + 28 | 0) >> 2] = 7,
                        ($a + 32 | 0) >>> 0 < w >>> 0)
                            for (ds = ls; nl[(cs = ds + 4 | 0) >> 2] = 7,
                            (ds + 8 | 0) >>> 0 < w >>> 0; )
                                ds = cs;
                        if ((0 | $a) != (0 | Fo)) {
                            if (fs = $a - Fo | 0,
                            ms = -2 & (0 | nl[us >> 2]),
                            nl[us >> 2] = ms,
                            Es = 1 | fs,
                            nl[(Fo + 4 | 0) >> 2] = Es,
                            Ss = (nl[$a >> 2] = fs) >>> 3,
                            fs >>> 0 < 256) {
                                hs = 212 + ((ps = Ss << 1) << 2) | 0,
                                0 == (0 | (_s = 0 | nl[43]) & (Fs = 1 << Ss)) ? (gs = _s | Fs,
                                nl[43] = gs,
                                A = 212 + ((ps + 2 | 0) << 2) | 0,
                                Ts = hs) : (ys = 0 | nl[(vs = 212 + ((ps + 2 | 0) << 2) | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0 ? il() : (A = vs,
                                Ts = ys),
                                nl[A >> 2] = Fo,
                                nl[(Ts + 12 | 0) >> 2] = Fo,
                                nl[(Fo + 8 | 0) >> 2] = Ts,
                                nl[(Fo + 12 | 0) >> 2] = hs;
                                break
                            }
                            if (j = 476 + ((Ps = 0 == (0 | (Rs = fs >>> 8)) ? 0 : 16777215 < fs >>> 0 ? 31 : 1 & fs >>> (7 + (Y = (14 - ((H = 4 & (520192 + (As = Rs << (Os = 8 & (Rs + 1048320 | 0) >>> 16)) | 0) >>> 16) | Os | (z = 2 & (245760 + (U = As << H) | 0) >>> 16)) | 0) + (U << z >>> 15) | 0) | 0) | Y << 1) << 2) | 0,
                            nl[(Fo + 28 | 0) >> 2] = Ps,
                            nl[(Fo + 20 | 0) >> 2] = 0,
                            (nl[Qa >> 2] = 0) == (0 | (V = 0 | nl[44]) & (W = 1 << Ps))) {
                                q = V | W,
                                nl[44] = q,
                                nl[j >> 2] = Fo,
                                nl[(Fo + 24 | 0) >> 2] = j,
                                nl[(Fo + 12 | 0) >> 2] = Fo,
                                nl[(Fo + 8 | 0) >> 2] = Fo;
                                break
                            }
                            K = 0 | nl[j >> 2],
                            X = (0 | -8 & (0 | nl[(K + 4 | 0) >> 2])) == (0 | fs);
                            r: do {
                                if (X)
                                    ru = K;
                                else {
                                    for (Bs = fs << (31 == (0 | Ps) ? 0 : 25 - (Ps >>> 1) | 0),
                                    su = K; ; ) {
                                        if (0 == (0 | (J = 0 | nl[(Z = (su + 16 | 0) + (Bs >>> 31 << 2) | 0) >> 2]))) {
                                            p = Z,
                                            uu = su;
                                            break
                                        }
                                        if (G = Bs << 1,
                                        (0 | -8 & (0 | nl[(J + 4 | 0) >> 2])) == (0 | fs)) {
                                            ru = J;
                                            break r
                                        }
                                        Bs = G,
                                        su = J
                                    }
                                    if (!(p >>> 0 < (0 | nl[47]) >>> 0)) {
                                        nl[p >> 2] = Fo,
                                        nl[(Fo + 24 | 0) >> 2] = uu,
                                        nl[(Fo + 12 | 0) >> 2] = Fo,
                                        nl[(Fo + 8 | 0) >> 2] = Fo;
                                        break e
                                    }
                                    il()
                                }
                            } while (0);
                            if ($ = 0 | nl[(Q = ru + 8 | 0) >> 2],
                            (ee = 0 | nl[47]) >>> 0 <= $ >>> 0 & ee >>> 0 <= ru >>> 0) {
                                nl[($ + 12 | 0) >> 2] = Fo,
                                nl[Q >> 2] = Fo,
                                nl[(Fo + 8 | 0) >> 2] = $,
                                nl[(Fo + 12 | 0) >> 2] = ru,
                                nl[(Fo + 24 | 0) >> 2] = 0;
                                break
                            }
                            il()
                        }
                    }
                } while (0);
                if (mu >>> 0 < (te = 0 | nl[46]) >>> 0)
                    return ne = te - mu | 0,
                    nl[46] = ne,
                    ie = (oe = 0 | nl[49]) + mu | 0,
                    nl[49] = ie,
                    ae = 1 | ne,
                    nl[(oe + (mu + 4 | 0) | 0) >> 2] = ae,
                    se = 3 | mu,
                    nl[(oe + 4 | 0) >> 2] = se,
                    0 | (fu = oe + 8 | 0)
            }
            return t = 0 | ul(),
            nl[t >> 2] = 12,
            (fu = 0) | fu
        },
        _free: function(e) {
            var r, t, n, o, i, a, s, u, l, c, d, f, m, E, S, p, h, _ = 0, w = 0, F = 0, g = 0, v = 0, y = 0, M = 0, R = 0, O = 0, A = 0, T = 0, b = 0, N = 0, D = 0, k = 0, P = 0, C = 0, L = 0, I = 0, B = 0, x = 0, H = 0, U = 0, z = 0, Y = 0, j = 0, V = 0, W = 0, q = 0, K = 0, X = 0, G = 0, J = 0, Z = 0, Q = 0, $ = 0, ee = 0, re = 0, te = 0, ne = 0, oe = 0, ie = 0, ae = 0, se = 0, ue = 0, le = 0, ce = 0, de = 0, fe = 0, me = 0, Ee = 0, Se = 0, pe = 0, he = 0, _e = 0, we = 0, Fe = 0, ge = 0, ve = 0, ye = 0, Me = 0, Re = 0, Oe = 0, Ae = 0, Te = 0, be = 0, Ne = 0, De = 0, ke = 0, Pe = 0, Ce = 0, Le = 0, Ie = 0, Be = 0, xe = 0, He = 0, Ue = 0, ze = 0, Ye = 0, je = 0, Ve = 0, We = 0, qe = 0, Ke = 0, Xe = 0, Ge = 0, Je = 0, Ze = 0, Qe = 0, $e = 0, er = 0, rr = 0, tr = 0, nr = 0, or = 0, ir = 0, ar = 0, sr = 0, ur = 0, lr = 0, cr = 0, dr = 0, fr = 0, mr = 0, Er = 0, Sr = 0, pr = 0, hr = 0, _r = 0, wr = 0, Fr = 0, gr = 0, vr = 0, yr = 0, Mr = 0, Rr = 0, Or = 0, Ar = 0, Tr = 0, br = 0, Nr = 0, Dr = 0, kr = 0, Pr = 0, Cr = 0;
            if (0 != (0 | (e |= 0))) {
                (r = e + -8 | 0) >>> 0 < (i = 0 | nl[47]) >>> 0 && il(),
                1 == (0 | (S = 3 & (E = 0 | nl[(e + -4 | 0) >> 2]))) && il(),
                h = e + ((p = -8 & E) - 8 | 0) | 0,
                t = 0 == (0 | 1 & E);
                do {
                    if (t) {
                        if (A = 0 | nl[r >> 2],
                        0 == (0 | S))
                            return;
                        if (H = A + p | 0,
                        (B = e + (v = -8 - A | 0) | 0) >>> 0 < i >>> 0 && il(),
                        (0 | B) == (0 | nl[48])) {
                            if (3 == (0 | 3 & (M = 0 | nl[(y = e + (p + -4 | 0) | 0) >> 2])))
                                return nl[45] = H,
                                R = -2 & M,
                                nl[y >> 2] = R,
                                O = 1 | H,
                                nl[(e + (v + 4 | 0) | 0) >> 2] = O,
                                void (nl[h >> 2] = H);
                            Nr = B,
                            Dr = H;
                            break
                        }
                        if (ne = A >>> 3,
                        A >>> 0 < 256) {
                            if (me = 0 | nl[(e + (v + 8 | 0) | 0) >> 2],
                            ve = 0 | nl[(e + (v + 12 | 0) | 0) >> 2],
                            (0 | me) == (0 | (be = 212 + (ne << 1 << 2) | 0)) || (me >>> 0 < i >>> 0 && il(),
                            (0 | nl[(me + 12 | 0) >> 2]) == (0 | B) || il()),
                            (0 | ve) == (0 | me)) {
                                Ye = -1 ^ 1 << ne,
                                je = (0 | nl[43]) & Ye,
                                nl[43] = je,
                                Nr = B,
                                Dr = H;
                                break
                            }
                            (0 | ve) == (0 | be) ? F = ve + 8 | 0 : (ve >>> 0 < i >>> 0 && il(),
                            (0 | nl[(Ve = ve + 8 | 0) >> 2]) == (0 | B) ? F = Ve : il()),
                            nl[(me + 12 | 0) >> 2] = ve,
                            nl[F >> 2] = me,
                            Nr = B,
                            Dr = H;
                            break
                        }
                        We = 0 | nl[(e + (v + 24 | 0) | 0) >> 2],
                        Ke = (0 | (qe = 0 | nl[(e + (v + 12 | 0) | 0) >> 2])) == (0 | B);
                        do {
                            if (Ke) {
                                if (0 == (0 | (Qe = 0 | nl[(Ze = e + (v + 20 | 0) | 0) >> 2]))) {
                                    if (0 == (0 | (er = 0 | nl[($e = e + (v + 16 | 0) | 0) >> 2]))) {
                                        wr = 0;
                                        break
                                    }
                                    hr = er,
                                    yr = $e
                                } else
                                    hr = Qe,
                                    yr = Ze;
                                for (; ; )
                                    if (0 == (0 | (tr = 0 | nl[(rr = hr + 20 | 0) >> 2]))) {
                                        if (0 == (0 | (or = 0 | nl[(nr = hr + 16 | 0) >> 2]))) {
                                            _r = hr,
                                            Mr = yr;
                                            break
                                        }
                                        hr = or,
                                        yr = nr
                                    } else
                                        hr = tr,
                                        yr = rr;
                                if (!(Mr >>> 0 < i >>> 0)) {
                                    nl[Mr >> 2] = 0,
                                    wr = _r;
                                    break
                                }
                                il()
                            } else {
                                if ((Xe = 0 | nl[(e + (v + 8 | 0) | 0) >> 2]) >>> 0 < i >>> 0 && il(),
                                (0 | nl[(Ge = Xe + 12 | 0) >> 2]) == (0 | B) || il(),
                                (0 | nl[(Je = qe + 8 | 0) >> 2]) == (0 | B)) {
                                    nl[Ge >> 2] = qe,
                                    nl[Je >> 2] = Xe,
                                    wr = qe;
                                    break
                                }
                                il()
                            }
                        } while (0);
                        if (0 == (0 | We))
                            Nr = B,
                            Dr = H;
                        else {
                            if (ir = 0 | nl[(e + (v + 28 | 0) | 0) >> 2],
                            (0 | B) == (0 | nl[(ar = 476 + (ir << 2) | 0) >> 2])) {
                                if (0 == (0 | (nl[ar >> 2] = wr))) {
                                    sr = -1 ^ 1 << ir,
                                    ur = (0 | nl[44]) & sr,
                                    nl[44] = ur,
                                    Nr = B,
                                    Dr = H;
                                    break
                                }
                            } else if (We >>> 0 < (0 | nl[47]) >>> 0 && il(),
                            (0 | nl[(lr = We + 16 | 0) >> 2]) == (0 | B) ? nl[lr >> 2] = wr : nl[(We + 20 | 0) >> 2] = wr,
                            0 == (0 | wr)) {
                                Nr = B,
                                Dr = H;
                                break
                            }
                            wr >>> 0 < (cr = 0 | nl[47]) >>> 0 && il(),
                            nl[(wr + 24 | 0) >> 2] = We,
                            fr = 0 == (0 | (dr = 0 | nl[(e + (v + 16 | 0) | 0) >> 2]));
                            do {
                                if (!fr) {
                                    if (!(dr >>> 0 < cr >>> 0)) {
                                        nl[(wr + 16 | 0) >> 2] = dr,
                                        nl[(dr + 24 | 0) >> 2] = wr;
                                        break
                                    }
                                    il()
                                }
                            } while (0);
                            if (0 == (0 | (mr = 0 | nl[(e + (v + 20 | 0) | 0) >> 2])))
                                Nr = B,
                                Dr = H;
                            else {
                                if (!(mr >>> 0 < (0 | nl[47]) >>> 0)) {
                                    nl[(wr + 20 | 0) >> 2] = mr,
                                    nl[(mr + 24 | 0) >> 2] = wr,
                                    Nr = B,
                                    Dr = H;
                                    break
                                }
                                il()
                            }
                        }
                    } else
                        Nr = r,
                        Dr = p
                } while (0);
                if (Nr >>> 0 < h >>> 0 || il(),
                0 == (0 | 1 & (o = 0 | nl[(n = e + (p + -4 | 0) | 0) >> 2])) && il(),
                0 == (0 | 2 & o)) {
                    if ((0 | h) == (0 | nl[49])) {
                        if (T = (0 | nl[46]) + Dr | 0,
                        nl[46] = T,
                        nl[49] = Nr,
                        b = 1 | T,
                        nl[(Nr + 4 | 0) >> 2] = b,
                        (0 | Nr) != (0 | nl[48]))
                            return;
                        return nl[48] = 0,
                        void (nl[45] = 0)
                    }
                    if ((0 | h) == (0 | nl[48]))
                        return N = (0 | nl[45]) + Dr | 0,
                        nl[45] = N,
                        nl[48] = Nr,
                        D = 1 | N,
                        nl[(Nr + 4 | 0) >> 2] = D,
                        void (nl[(Nr + N | 0) >> 2] = N);
                    k = (-8 & o) + Dr | 0,
                    P = o >>> 3,
                    C = o >>> 0 < 256;
                    do {
                        if (C) {
                            if (L = 0 | nl[(e + p | 0) >> 2],
                            I = 0 | nl[(e + (4 | p) | 0) >> 2],
                            (0 | L) == (0 | (x = 212 + (P << 1 << 2) | 0)) || (L >>> 0 < (0 | nl[47]) >>> 0 && il(),
                            (0 | nl[(L + 12 | 0) >> 2]) == (0 | h) || il()),
                            (0 | I) == (0 | L)) {
                                U = -1 ^ 1 << P,
                                z = (0 | nl[43]) & U,
                                nl[43] = z;
                                break
                            }
                            (0 | I) == (0 | x) ? w = I + 8 | 0 : (I >>> 0 < (0 | nl[47]) >>> 0 && il(),
                            (0 | nl[(Y = I + 8 | 0) >> 2]) == (0 | h) ? w = Y : il()),
                            nl[(L + 12 | 0) >> 2] = I,
                            nl[w >> 2] = L
                        } else {
                            j = 0 | nl[(e + (p + 16 | 0) | 0) >> 2],
                            W = (0 | (V = 0 | nl[(e + (4 | p) | 0) >> 2])) == (0 | h);
                            do {
                                if (W) {
                                    if (0 == (0 | (J = 0 | nl[(G = e + (p + 12 | 0) | 0) >> 2]))) {
                                        if (0 == (0 | (Q = 0 | nl[(Z = e + (p + 8 | 0) | 0) >> 2]))) {
                                            vr = 0;
                                            break
                                        }
                                        Fr = Q,
                                        Rr = Z
                                    } else
                                        Fr = J,
                                        Rr = G;
                                    for (; ; )
                                        if (0 == (0 | (ee = 0 | nl[($ = Fr + 20 | 0) >> 2]))) {
                                            if (0 == (0 | (te = 0 | nl[(re = Fr + 16 | 0) >> 2]))) {
                                                gr = Fr,
                                                Or = Rr;
                                                break
                                            }
                                            Fr = te,
                                            Rr = re
                                        } else
                                            Fr = ee,
                                            Rr = $;
                                    if (!(Or >>> 0 < (0 | nl[47]) >>> 0)) {
                                        nl[Or >> 2] = 0,
                                        vr = gr;
                                        break
                                    }
                                    il()
                                } else {
                                    if ((q = 0 | nl[(e + p | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                    (0 | nl[(K = q + 12 | 0) >> 2]) == (0 | h) || il(),
                                    (0 | nl[(X = V + 8 | 0) >> 2]) == (0 | h)) {
                                        nl[K >> 2] = V,
                                        nl[X >> 2] = q,
                                        vr = V;
                                        break
                                    }
                                    il()
                                }
                            } while (0);
                            if (0 != (0 | j)) {
                                if (oe = 0 | nl[(e + (p + 20 | 0) | 0) >> 2],
                                (0 | h) == (0 | nl[(ie = 476 + (oe << 2) | 0) >> 2])) {
                                    if (0 == (0 | (nl[ie >> 2] = vr))) {
                                        ae = -1 ^ 1 << oe,
                                        se = (0 | nl[44]) & ae,
                                        nl[44] = se;
                                        break
                                    }
                                } else if (j >>> 0 < (0 | nl[47]) >>> 0 && il(),
                                (0 | nl[(ue = j + 16 | 0) >> 2]) == (0 | h) ? nl[ue >> 2] = vr : nl[(j + 20 | 0) >> 2] = vr,
                                0 == (0 | vr))
                                    break;
                                vr >>> 0 < (le = 0 | nl[47]) >>> 0 && il(),
                                nl[(vr + 24 | 0) >> 2] = j,
                                de = 0 == (0 | (ce = 0 | nl[(e + (p + 8 | 0) | 0) >> 2]));
                                do {
                                    if (!de) {
                                        if (!(ce >>> 0 < le >>> 0)) {
                                            nl[(vr + 16 | 0) >> 2] = ce,
                                            nl[(ce + 24 | 0) >> 2] = vr;
                                            break
                                        }
                                        il()
                                    }
                                } while (0);
                                if (0 != (0 | (fe = 0 | nl[(e + (p + 12 | 0) | 0) >> 2]))) {
                                    if (!(fe >>> 0 < (0 | nl[47]) >>> 0)) {
                                        nl[(vr + 20 | 0) >> 2] = fe,
                                        nl[(fe + 24 | 0) >> 2] = vr;
                                        break
                                    }
                                    il()
                                }
                            }
                        }
                    } while (0);
                    if (Ee = 1 | k,
                    nl[(Nr + 4 | 0) >> 2] = Ee,
                    nl[(Nr + k | 0) >> 2] = k,
                    (0 | Nr) == (0 | nl[48]))
                        return void (nl[45] = k);
                    kr = k
                } else
                    Se = -2 & o,
                    nl[n >> 2] = Se,
                    pe = 1 | Dr,
                    nl[(Nr + 4 | 0) >> 2] = pe,
                    kr = nl[(Nr + Dr | 0) >> 2] = Dr;
                if (a = kr >>> 3,
                kr >>> 0 < 256)
                    return _e = 212 + ((he = a << 1) << 2) | 0,
                    0 == (0 | (we = 0 | nl[43]) & (Fe = 1 << a)) ? (ge = we | Fe,
                    nl[43] = ge,
                    g = 212 + ((he + 2 | 0) << 2) | 0,
                    Er = _e) : (Me = 0 | nl[(ye = 212 + ((he + 2 | 0) << 2) | 0) >> 2]) >>> 0 < (0 | nl[47]) >>> 0 ? il() : (g = ye,
                    Er = Me),
                    nl[g >> 2] = Nr,
                    nl[(Er + 12 | 0) >> 2] = Nr,
                    nl[(Nr + 8 | 0) >> 2] = Er,
                    void (nl[(Nr + 12 | 0) >> 2] = _e);
                u = 476 + ((Sr = 0 == (0 | (s = kr >>> 8)) ? 0 : 16777215 < kr >>> 0 ? 31 : 1 & kr >>> (7 + (De = (14 - ((Ae = 4 & (520192 + (Oe = s << (Re = 8 & (s + 1048320 | 0) >>> 16)) | 0) >>> 16) | Re | (Ne = 2 & (245760 + (Te = Oe << Ae) | 0) >>> 16)) | 0) + (Te << Ne >>> 15) | 0) | 0) | De << 1) << 2) | 0,
                nl[(Nr + 28 | 0) >> 2] = Sr,
                l = Nr + 16 | 0,
                nl[(Nr + 20 | 0) >> 2] = 0,
                f = (nl[l >> 2] = 0) == (0 | (c = 0 | nl[44]) & (d = 1 << Sr));
                e: do {
                    if (f)
                        ke = c | d,
                        nl[44] = ke,
                        nl[u >> 2] = Nr,
                        nl[(Nr + 24 | 0) >> 2] = u,
                        nl[(Nr + 12 | 0) >> 2] = Nr,
                        nl[(Nr + 8 | 0) >> 2] = Nr;
                    else {
                        Pe = 0 | nl[u >> 2],
                        Ce = (0 | -8 & (0 | nl[(Pe + 4 | 0) >> 2])) == (0 | kr);
                        r: do {
                            if (Ce)
                                Ar = Pe;
                            else {
                                for (pr = kr << (31 == (0 | Sr) ? 0 : 25 - (Sr >>> 1) | 0),
                                Tr = Pe; ; ) {
                                    if (0 == (0 | (Ie = 0 | nl[(Be = (Tr + 16 | 0) + (pr >>> 31 << 2) | 0) >> 2]))) {
                                        _ = Be,
                                        br = Tr;
                                        break
                                    }
                                    if (Le = pr << 1,
                                    (0 | -8 & (0 | nl[(Ie + 4 | 0) >> 2])) == (0 | kr)) {
                                        Ar = Ie;
                                        break r
                                    }
                                    pr = Le,
                                    Tr = Ie
                                }
                                if (!(_ >>> 0 < (0 | nl[47]) >>> 0)) {
                                    nl[_ >> 2] = Nr,
                                    nl[(Nr + 24 | 0) >> 2] = br,
                                    nl[(Nr + 12 | 0) >> 2] = Nr,
                                    nl[(Nr + 8 | 0) >> 2] = Nr;
                                    break e
                                }
                                il()
                            }
                        } while (0);
                        if (He = 0 | nl[(xe = Ar + 8 | 0) >> 2],
                        (Ue = 0 | nl[47]) >>> 0 <= He >>> 0 & Ue >>> 0 <= Ar >>> 0) {
                            nl[(He + 12 | 0) >> 2] = Nr,
                            nl[xe >> 2] = Nr,
                            nl[(Nr + 8 | 0) >> 2] = He,
                            nl[(Nr + 12 | 0) >> 2] = Ar,
                            nl[(Nr + 24 | 0) >> 2] = 0;
                            break
                        }
                        il()
                    }
                } while (0);
                if (m = (0 | nl[51]) - 1 | 0,
                0 == (0 | (nl[51] = m))) {
                    for (Cr = 628; ze = 8 + (Pr = 0 | nl[Cr >> 2]) | 0,
                    0 != (0 | Pr); )
                        Cr = ze;
                    nl[51] = -1
                }
            }
        },
        _G711Decoder_temp: function(e, r, t, n) {
            e |= 0,
            r |= 0,
            t |= 0,
            n |= 0;
            var o, i, a, s, u = 0, l = 0, c = 0;
            if ((0 | j) <= (0 | (Y = (s = Y) + 32 | 0)) && V(),
            o = e,
            i = r,
            a = t,
            (c = 0) == (0 | n)) {
                for (; (0 | c) < (0 | a); )
                    u = 0 | w(0 | d[(i + c | 0) >> 0]),
                    f[(o + (c << 1) | 0) >> 1] = u,
                    c = c + 1 | 0;
                Y = s
            } else {
                for (; (0 | c) < (0 | a); )
                    l = 0 | g(0 | d[(i + c | 0) >> 0]),
                    f[(o + (c << 1) | 0) >> 1] = l,
                    c = c + 1 | 0;
                Y = s
            }
        },
        _G711Decoder: function(e, r, t, n) {
            e |= 0,
            r |= 0,
            t |= 0,
            n |= 0;
            var o, i, a, s, u = 0, l = 0, c = 0;
            if ((0 | j) <= (0 | (Y = (s = Y) + 32 | 0)) && V(),
            o = r,
            i = t,
            a = e,
            (c = 0) == (0 | n)) {
                for (; (0 | c) < (0 | i); )
                    u = 0 | w(0 | d[(o + c | 0) >> 0]),
                    f[(a + (c << 1) | 0) >> 1] = u,
                    c = c + 1 | 0;
                return Y = s,
                0
            }
            for (; (0 | c) < (0 | i); )
                l = 0 | g(0 | d[(o + c | 0) >> 0]),
                f[(a + (c << 1) | 0) >> 1] = l,
                c = c + 1 | 0;
            return Y = s,
            0
        },
        _fflush: function e(r) {
            var t, n = 0, o = 0, i = 0, a = 0, s = 0, u = 0, l = 0, c = 0, d = 0, f = 0;
            t = 0 == (0 | (r |= 0));
            do {
                if (t) {
                    if (u = 0 == (0 | nl[13]) ? 0 : 0 | e(0 | nl[13]),
                    m(36),
                    0 == (0 | (i = 0 | nl[8])))
                        c = u;
                    else
                        for (a = i,
                        d = u; ; ) {
                            if (-1 < (0 | nl[(a + 76 | 0) >> 2]) ? 0 | v() : 0,
                            s = 0 | nl[(a + 20 | 0) >> 2],
                            f = (0 | nl[(a + 28 | 0) >> 2]) >>> 0 < s >>> 0 ? 0 | M(a) | d : d,
                            0 == (0 | (o = 0 | nl[(a + 56 | 0) >> 2]))) {
                                c = f;
                                break
                            }
                            a = o,
                            d = f
                        }
                    S(36),
                    n = c
                } else {
                    if (!(-1 < (0 | nl[(r + 76 | 0) >> 2]))) {
                        n = 0 | M(r);
                        break
                    }
                    0 == (0 | v()),
                    l = 0 | M(r),
                    n = l
                }
            } while (0);
            return 0 | n
        },
        _ch_add: function(e, r) {
            var t;
            return e |= 0,
            r |= 0,
            (0 | j) <= (0 | (Y = (t = Y) + 16 | 0)) && V(),
            Y = t,
            0 | (e << 24 >> 24) + (r << 24 >> 24)
        },
        ___errno_location: ul,
        runPostSets: function() {},
        stackAlloc: function(e) {
            var r;
            return (0 | j) <= (0 | (Y = 15 + (Y = (r = Y) + (e |= 0) | 0) & -16)) && V(),
            0 | r
        },
        stackSave: function() {
            return 0 | Y
        },
        stackRestore: function(e) {
            Y = e |= 0
        },
        establishStackSpace: function(e, r) {
            Y = e |= 0,
            j = r |= 0
        },
        setThrew: function(e, r) {
            e |= 0,
            r |= 0,
            0 == (0 | n) && (n = e,
            r)
        },
        setTempRet0: function(e) {
            o = e |= 0
        },
        getTempRet0: function() {
            return 0 | o
        },
        dynCall_ii: function(e, r) {
            return r |= 0,
            0 | A[1 & (e |= 0)](0 | r)
        },
        dynCall_iiii: function(e, r, t, n) {
            return r |= 0,
            t |= 0,
            n |= 0,
            0 | T[7 & (e |= 0)](0 | r, 0 | t, 0 | n)
        },
        dynCall_vi: function(e, r) {
            r |= 0,
            b[7 & (e |= 0)](0 | r)
        }
    }
}(Module.asmGlobalArg, Module.asmLibraryArg, buffer)
  , real__G711Encoder = asm._G711Encoder;
asm._G711Encoder = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__G711Encoder.apply(null, arguments)
}
;
var real__int_add = asm._int_add;
asm._int_add = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__int_add.apply(null, arguments)
}
;
var real__ch_test2 = asm._ch_test2;
asm._ch_test2 = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__ch_test2.apply(null, arguments)
}
;
var real__ch_test1 = asm._ch_test1;
asm._ch_test1 = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__ch_test1.apply(null, arguments)
}
;
var real__G711Decoder_temp = asm._G711Decoder_temp;
asm._G711Decoder_temp = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__G711Decoder_temp.apply(null, arguments)
}
;
var real__malloc = asm._malloc;
asm._malloc = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__malloc.apply(null, arguments)
}
;
var real__G711Decoder = asm._G711Decoder;
asm._G711Decoder = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__G711Decoder.apply(null, arguments)
}
;
var real__free = asm._free;
asm._free = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__free.apply(null, arguments)
}
;
var real__fflush = asm._fflush;
asm._fflush = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__fflush.apply(null, arguments)
}
;
var real__ch_add = asm._ch_add;
asm._ch_add = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real__ch_add.apply(null, arguments)
}
;
var real____errno_location = asm.___errno_location;
asm.___errno_location = function() {
    return assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)"),
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)"),
    real____errno_location.apply(null, arguments)
}
;
var _G711Encoder = Module._G711Encoder = asm._G711Encoder, _int_add = Module._int_add = asm._int_add, _ch_test2 = Module._ch_test2 = asm._ch_test2, runPostSets = Module.runPostSets = asm.runPostSets, _ch_test1 = Module._ch_test1 = asm._ch_test1, _G711Decoder_temp = Module._G711Decoder_temp = asm._G711Decoder_temp, _memset = Module._memset = asm._memset, _malloc = Module._malloc = asm._malloc, _memcpy = Module._memcpy = asm._memcpy, _G711Decoder = Module._G711Decoder = asm._G711Decoder, _free = Module._free = asm._free, _fflush = Module._fflush = asm._fflush, _ch_add = Module._ch_add = asm._ch_add, ___errno_location = Module.___errno_location = asm.___errno_location, dynCall_ii = Module.dynCall_ii = asm.dynCall_ii, dynCall_iiii = Module.dynCall_iiii = asm.dynCall_iiii, dynCall_vi = Module.dynCall_vi = asm.dynCall_vi, initialStackTop;
function ExitStatus(e) {
    this.name = "ExitStatus",
    this.message = "Program terminated with exit(" + e + ")",
    this.status = e
}
Runtime.stackAlloc = asm.stackAlloc,
Runtime.stackSave = asm.stackSave,
Runtime.stackRestore = asm.stackRestore,
Runtime.establishStackSpace = asm.establishStackSpace,
Runtime.setTempRet0 = asm.setTempRet0,
Runtime.getTempRet0 = asm.getTempRet0,
ExitStatus.prototype = new Error,
ExitStatus.prototype.constructor = ExitStatus;
var preloadStartTime = null
  , calledMain = !1;
function run(e) {
    function r() {
        Module.calledRun || (Module.calledRun = !0,
        ABORT || (ensureInitRuntime(),
        preMain(),
        ENVIRONMENT_IS_WEB && null !== preloadStartTime && Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms"),
        Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
        Module._main && shouldRunNow && Module.callMain(e),
        postRun()))
    }
    e = e || Module.arguments,
    null === preloadStartTime && (preloadStartTime = Date.now()),
    0 < runDependencies ? Module.printErr("run() called, but dependencies remain, so not running") : (preRun(),
    0 < runDependencies || Module.calledRun || (Module.setStatus ? (Module.setStatus("Running..."),
    setTimeout(function() {
        setTimeout(function() {
            Module.setStatus("")
        }, 1),
        r()
    }, 1)) : r()))
}
function exit(e, r) {
    if (!r || !Module.noExitRuntime)
        throw Module.noExitRuntime ? Module.printErr("exit(" + e + ") called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)") : (ABORT = !0,
        EXITSTATUS = e,
        STACKTOP = initialStackTop,
        exitRuntime(),
        Module.onExit && Module.onExit(e)),
        ENVIRONMENT_IS_NODE ? (process.stdout.once("drain", function() {
            process.exit(e)
        }),
        console.log(" "),
        setTimeout(function() {
            process.exit(e)
        }, 500)) : ENVIRONMENT_IS_SHELL && "function" == typeof quit && quit(e),
        new ExitStatus(e);
    Module.printErr("exit(" + e + ") implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)")
}
dependenciesFulfilled = function e() {
    Module.calledRun || run(),
    Module.calledRun || (dependenciesFulfilled = e)
}
,
Module.callMain = Module.callMain = function(e) {
    assert(0 == runDependencies, "cannot call main when async dependencies remain! (listen on __ATMAIN__)"),
    assert(0 == __ATPRERUN__.length, "cannot call main when preRun functions remain to be called"),
    e = e || [],
    ensureInitRuntime();
    var r = e.length + 1;
    function t() {
        for (var e = 0; e < 3; e++)
            n.push(0)
    }
    var n = [allocate(intArrayFromString(Module.thisProgram), "i8", ALLOC_NORMAL)];
    t();
    for (var o = 0; o < r - 1; o += 1)
        n.push(allocate(intArrayFromString(e[o]), "i8", ALLOC_NORMAL)),
        t();
    n.push(0),
    n = allocate(n, "i32", ALLOC_NORMAL);
    try {
        exit(Module._main(r, n, 0), !0)
    } catch (e) {
        if (e instanceof ExitStatus)
            return;
        if ("SimulateInfiniteLoop" == e)
            return void (Module.noExitRuntime = !0);
        throw e && "object" == typeof e && e.stack && Module.printErr("exception thrown: " + [e, e.stack]),
        e
    } finally {
        calledMain = !0
    }
}
,
Module.run = Module.run = run,
Module.exit = Module.exit = exit;
var abortDecorators = [];
function abort(r) {
    r = void 0 !== r ? (Module.print(r),
    Module.printErr(r),
    JSON.stringify(r)) : "",
    ABORT = !0,
    EXITSTATUS = 1;
    var t = "abort(" + r + ") at " + stackTrace();
    throw abortDecorators && abortDecorators.forEach(function(e) {
        t = e(t, r)
    }),
    t
}
if (Module.abort = Module.abort = abort,
Module.preInit)
    for ("function" == typeof Module.preInit && (Module.preInit = [Module.preInit]); 0 < Module.preInit.length; )
        Module.preInit.pop()();
var shouldRunNow = !0;
Module.noInitialRun && (shouldRunNow = !1),
run();
