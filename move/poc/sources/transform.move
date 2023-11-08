module poc::transform {
    use std::vector;

    const MAX_U32: u64 = 0xff_ff_ff_ff;

    const EInvalidTransformSize: u64 = 0;

    struct Transform has store, copy, drop {
        denominator: u64,
        m00: u64,
        m01: u64,
        m02: u64,
        m03: u64,
        m10: u64,
        m11: u64,
        m12: u64,
        m13: u64,
        m20: u64,
        m21: u64,
        m22: u64,
        m23: u64,
        m30: u64,
        m31: u64,
        m32: u64,
        m33: u64
    }

    public fun from_denominator_vec(denominator: u64, transform: vector<u64>): Transform {
        assert!(vector::length(&transform) == 16, EInvalidTransformSize);
        let m33 = vector::pop_back(&mut transform);
        let m32 = vector::pop_back(&mut transform);
        let m31 = vector::pop_back(&mut transform);
        let m30 = vector::pop_back(&mut transform);
        let m23 = vector::pop_back(&mut transform);
        let m22 = vector::pop_back(&mut transform);
        let m21 = vector::pop_back(&mut transform);
        let m20 = vector::pop_back(&mut transform);
        let m13 = vector::pop_back(&mut transform);
        let m12 = vector::pop_back(&mut transform);
        let m11 = vector::pop_back(&mut transform);
        let m10 = vector::pop_back(&mut transform);
        let m03 = vector::pop_back(&mut transform);
        let m02 = vector::pop_back(&mut transform);
        let m01 = vector::pop_back(&mut transform);
        let m00 = vector::pop_back(&mut transform);
        Transform {
            denominator,
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        }
    }

    public fun unit(): Transform {
        Transform {
            denominator: MAX_U32,
            m00: MAX_U32,
            m01: 0,
            m02: 0,
            m03: 0,
            m10: 0,
            m11: MAX_U32,
            m12: 0,
            m13: 0,
            m20: 0,
            m21: 0,
            m22: MAX_U32,
            m23: 0,
            m30: 0,
            m31: 0,
            m32: 0,
            m33: MAX_U32
        }
    }
}
