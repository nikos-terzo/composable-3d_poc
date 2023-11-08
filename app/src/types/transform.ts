export type MoveTransform = {
    denominator: string,
    m00: string, m01: string, m02: string, m03: string,
    m10: string, m11: string, m12: string, m13: string,
    m20: string, m21: string, m22: string, m23: string,
    m30: string, m31: string, m32: string, m33: string
};

export type FloatTranform = {

    m00: number, m01: number, m02: number, m03: number,
    m10: number, m11: number, m12: number, m13: number,
    m20: number, m21: number, m22: number, m23: number,
    m30: number, m31: number, m32: number, m33: number
};


export function intoFloatTransform(moveTransform: MoveTransform): FloatTranform {
    const denominator = parseInt(moveTransform.denominator);
    return {
        m00: parseInt(moveTransform.m00) / denominator, m01: parseInt(moveTransform.m01) / denominator, m02: parseInt(moveTransform.m02) / denominator, m03: parseInt(moveTransform.m03) / denominator,
        m10: parseInt(moveTransform.m10) / denominator, m11: parseInt(moveTransform.m11) / denominator, m12: parseInt(moveTransform.m12) / denominator, m13: parseInt(moveTransform.m13) / denominator,
        m20: parseInt(moveTransform.m20) / denominator, m21: parseInt(moveTransform.m21) / denominator, m22: parseInt(moveTransform.m22) / denominator, m23: parseInt(moveTransform.m23) / denominator,
        m30: parseInt(moveTransform.m30) / denominator, m31: parseInt(moveTransform.m31) / denominator, m32: parseInt(moveTransform.m32) / denominator, m33: parseInt(moveTransform.m33) / denominator,
    };
}
