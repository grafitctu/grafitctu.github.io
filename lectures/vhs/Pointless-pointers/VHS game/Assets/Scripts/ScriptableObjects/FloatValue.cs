using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu]
public class FloatValue : ScriptableObject
{
    public float initialValue;

    public static implicit operator FloatValue(float v)
    {
        throw new NotImplementedException();
    }
}
