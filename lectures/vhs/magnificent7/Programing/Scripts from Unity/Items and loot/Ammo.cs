using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Ammo", menuName = "CustomObjects/Ammo")]
public class Ammo : ScriptableObject
{
    [SerializeField] private string type;

    public string GetAmmoType()
    {
        return type;
    }
}
