using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class AmmoPack
{
    [SerializeField] private Ammo ammunitionType = null;
    [SerializeField] private int quantity = 0;

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
    [SerializeField] private Item itemType = null;
    [SerializeField] private int quantity = 0;

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
    [SerializeField] private int gold = 0;
    [SerializeField] private AmmoPack[] ammunition = null;
    [SerializeField] private ItemPack[] items = null;

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
