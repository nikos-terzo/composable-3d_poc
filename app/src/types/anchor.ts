export type MoveAnchorField = {
    id: {
        id: string
    },
    name: {
        type: `${string}::object3d::AnchorID`,
        fields: { id: number }
    },
    value: {
        type: `${string}::object3d::Anchor`,
        fields: MoveAnchor
    }
};

export type MoveAnchor = {
    attached?: string,
    id: {
        type: `${string}::object3d::AnchorID`,
        fields: { id: 0 }
    },
    transform: {
        type: `${string}::transform::Transform`,
        fields: {
            denominator: string,
            m00: string, m01: string, m02: string, m03: string,
            m10: string, m11: string, m12: string, m13: string,
            m20: string, m21: string, m22: string, m23: string,
            m30: string, m31: string, m32: string, m33: string
        }
    },
    attaches_to: string
};

export type Anchor = {
    id: number,
    transform: {
        m00: number, m01: number, m02: number, m03: number,
        m10: number, m11: number, m12: number, m13: number,
        m20: number, m21: number, m22: number, m23: number,
        m30: number, m31: number, m32: number, m33: number
    },
    attachesTo: string
};

export function intoAnchor(moveAnchor: MoveAnchor): Anchor {
    const transform = moveAnchor.transform.fields;
    const denominator = parseInt(transform.denominator);
    return {
        id: moveAnchor.id.fields.id,
        transform: {
            m00: parseInt(transform.m00) / denominator, m01: parseInt(transform.m01) / denominator, m02: parseInt(transform.m02) / denominator, m03: parseInt(transform.m03) / denominator,
            m10: parseInt(transform.m10) / denominator, m11: parseInt(transform.m11) / denominator, m12: parseInt(transform.m12) / denominator, m13: parseInt(transform.m13) / denominator,
            m20: parseInt(transform.m20) / denominator, m21: parseInt(transform.m21) / denominator, m22: parseInt(transform.m22) / denominator, m23: parseInt(transform.m23) / denominator,
            m30: parseInt(transform.m30) / denominator, m31: parseInt(transform.m31) / denominator, m32: parseInt(transform.m32) / denominator, m33: parseInt(transform.m33) / denominator
        },
        attachesTo: moveAnchor.attaches_to
    };
}
