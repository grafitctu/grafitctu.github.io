using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Lootable : MonoBehaviour, IInteractible
{
    [SerializeField] private bool isLootable = false;
    [SerializeField] private LootTable lootTable = null;

    [SerializeField] private string lootableName = "";

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

    public void SetInteractible(bool val)
    {

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
        return lootableName;
    }

    private void Loot()
    {
        //Play Loot Sound

        GetComponent<QuestActor>()?.NPCKilled();

        isLootable = false;

        GetComponent<ParticleSystem>().Stop();

        HelpTextManager.current.AddLoot(LOOT_GOLD,lootTable.GetGold());
        GameManager.current.playerObject.GetComponent<Player_Base>().LootGold(lootTable.GetGold());

        foreach(AmmoPack ammoPack in lootTable.GetAmmos())
        {
            HelpTextManager.current.AddLoot(ammoPack.GetAmmoType().GetAmmoType(), ammoPack.GetQuantity());
        }

        foreach(ItemPack itemPack in lootTable.GetItems())
        {
            HelpTextManager.current.AddLoot(itemPack.GetItemType().GetItemName(), itemPack.GetQuantity());
            switch (itemPack.GetItemType().GetItemName().ToString())
            {
                case ("Revolver"):
                    GameManager.current.playerObject.GetComponent<Player_Base>().LootWeapon(1);
                    break;
                case ("Shotgun"):
                    GameManager.current.playerObject.GetComponent<Player_Base>().LootWeapon(2);
                    break;
                case ("Winchester"):
                    GameManager.current.playerObject.GetComponent<Player_Base>().LootWeapon(3);
                    break;
                default:
                    break;
            }
        }

        Destroy(this.gameObject, 4f);
    }


}
