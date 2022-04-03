using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Lootable : MonoBehaviour, IInteractible
{
    [SerializeField] private bool isLootable = false;
    [SerializeField] private LootTable lootTable = null;

    [SerializeField] private string name = "";

    private static string LOOT_GOLD = "gold coins";

    private void Start()
    {
        GameEvents.current.onLootBoxActivated += SetLootableActive;
    }

    public void SetLootableActive()
    {
        isLootable = true;
        GetComponent<ParticleSystem>().Play();   
    }

    public void Interact()
    {
        if(isLootable)
        {
            Loot();
        }
    }

    public string GetName()
    {
        return name;
    }

    private void Loot()
    {
        //Play Loot Sound

        GetComponent<QuestActor>()?.NPCKilled();

        isLootable = false;

        GetComponent<ParticleSystem>().Stop();

        HelpTextManager.current.AddLoot(LOOT_GOLD,lootTable.GetGold());

        foreach(AmmoPack ammoPack in lootTable.GetAmmos())
        {
            HelpTextManager.current.AddLoot(ammoPack.GetAmmoType().GetAmmoType(), ammoPack.GetQuantity());
        }

        foreach(ItemPack itemPack in lootTable.GetItems())
        {
            HelpTextManager.current.AddLoot(itemPack.GetItemType().GetItemName(), itemPack.GetQuantity());
        }

        Destroy(this.gameObject);
    }


}
