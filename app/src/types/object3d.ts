import { Anchor } from "./anchor";
import { Slot } from "./slot";
import { FloatTranform, MoveTransform, intoFloatTransform } from "./transform";

export type MoveObject3D = {
    anchors:
    {
        type: string,
        fields:
        {
            id: { id: string },
            size: string
        }
    },
    attached?: {
        type: string,
        fields: { id: number }
    },
    id: { id: string },
    model_uri: string,
    slots: {
        type: string,
        fields: {
            id: { id: string },
            size: string
        }
    },
    transform: {
        type: string,
        fields: MoveTransform
    }
};

export type Object3D = {
    id: string,
    model_uri: string,
    slots: {
        id: string,
        size: number,
        parsed: Slot[]
    },
    anchors: {
        id: string,
        size: number,
        parsed: Anchor[]

    },
    transform: FloatTranform,
    attachedWithAnchor?: number
};

export function intoObject3D(moveObject3D: MoveObject3D): Object3D {
    return {
        id: moveObject3D.id.id,
        model_uri: moveObject3D.model_uri,
        slots: {
            id: moveObject3D.slots.fields.id.id,
            size: parseInt(moveObject3D.slots.fields.size),
            parsed: []
        },
        anchors: {
            id: moveObject3D.anchors.fields.id.id,
            size: parseInt(moveObject3D.anchors.fields.size),
            parsed: []
        },
        transform: intoFloatTransform(moveObject3D.transform.fields),
        attachedWithAnchor: moveObject3D.attached?.fields.id
    };
}

