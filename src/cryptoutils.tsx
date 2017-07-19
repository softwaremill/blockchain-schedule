const eutil = require('ethereumjs-util')

export function signAddress(privKey, address) {
    const msg = new Buffer(address)
    const addressHash = eutil.hashPersonalMessage(Buffer.from(address)) // address+prefix, hashed
    const sig = eutil.ecsign(addressHash, Buffer.from(eutil.stripHexPrefix(privKey), 'hex'))

    return {
        h: eutil.bufferToHex(addressHash),
        r: eutil.bufferToHex(sig.r),
        s: eutil.bufferToHex(sig.s),
        v: sig.v
    }
}
