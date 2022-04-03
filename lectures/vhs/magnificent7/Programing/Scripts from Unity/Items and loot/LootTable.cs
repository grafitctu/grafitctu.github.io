using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class AmmoPack
{
    [SerializeField] private Ammo ammunitionType;
    [SerializeField] private int quantity;

    public Ammo GetAmmoType()
    {
        return ammunitionType;
    }

    public int GetQuantity()
    {
        return quantity;
    }
}

[System.Serializable]
public class ItemPack
{
    [SerializeField] private Item itemType;
    [SerializeField] private int quantity;

    public Item GetItemType()
    {
        return itemType;
    }

    public int GetQuantity()
    {
        return quantity;
    }
}

[CreateAssetMenu(fileName = "Loot Table",menuName ="CustomObjects/Loot Table")]
public class LootTable : ScriptableObject
{
    [SerializeField] private int gold;
    [SerializeField] private AmmoPack[] ammunition;
    [SerializeField] private ItemPack[] items;

    public int GetGold()
    {
        return gold;
    }

    public AmmoPack[] GetAmmos()
    {
        return ammunition;
    }

    public ItemPack[] GetItems()
    {
        return items;
    }
}
