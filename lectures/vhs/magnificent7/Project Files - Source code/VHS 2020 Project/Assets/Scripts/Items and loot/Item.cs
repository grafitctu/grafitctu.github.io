using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Item", menuName = "CustomObjects/Item")]
public class Item : ScriptableObject
{
    [SerializeField] private string itemName = "";

    public string GetItemName()
    {
        return itemName;
    }
}
