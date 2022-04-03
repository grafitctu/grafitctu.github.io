using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public enum OptionType { ACCEPT, COMPLETE, TURNIN, NONQUEST, EXIT, LOOT, LOOT_ITEM, COMPLETEANDTURNIN, UNLOCKS, COMBAT_STARTS }
public enum LootType { NONE, GET, BUY_ITEM, BUY_SERVICE, LOSE, BUY_AMMO }
public class DialogOptionScript : MonoBehaviour
{

    public DialogOption optionReference;
    public OptionType optionType;
    public Objective objective;
    public string response;

    public LootType lootType;

    public int gold;
    public ItemPack lootItem;
    public AmmoPack lootAmmo;

    public bool oneTime;
    public bool alreadyUsed;

    public string unlockable;

    public void Action()
    {
        optionReference.alreadyUsed = true;
        switch (optionType)
        {
            case OptionType.ACCEPT:
                QuestTracker.current.AcceptQuest(objective.ObjectiveOf());
                DialogOptionManager.current.QuestChanged();
                GameEvents.current.QuestAccepted(objective.ObjectiveOf());
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.COMPLETE:
                QuestTracker.current.CompleteObjective(objective);
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.COMPLETEANDTURNIN:
                QuestTracker.current.CompleteObjective(objective);
                QuestTracker.current.TurnInQuest(objective.ObjectiveOf());
                GameEvents.current.QuestTurnedIn(objective.ObjectiveOf());
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.TURNIN:
                QuestTracker.current.TurnInQuest(objective.ObjectiveOf());
                GameEvents.current.QuestTurnedIn(objective.ObjectiveOf());
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.NONQUEST:
                DialogOptionManager.current.QuestChanged();
                if (response!="")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.LOOT:
                HelpTextManager.current.AddLoot("gold coins", gold);
                GameManager.current.playerObject.GetComponent<Player_Base>().LootGold(gold);
                if (oneTime)
                    DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.LOOT_ITEM:
                HelpTextManager.current.AddLoot(lootItem.GetItemType().ToString(), lootItem.GetQuantity());
                GameManager.current.playerObject.GetComponent<Player_Base>().LootItem(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                GameManager.current.playerObject.GetComponent<Player_Base>().LoseGold(gold);
                if (oneTime)
                    DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.EXIT:
                DialogOptionManager.current.ShowDialogWindow(false, null);
                break;
            case OptionType.UNLOCKS:
                if (GameObject.Find(unlockable).GetComponent<Unlockable>().IsLocked())
                {
                    GameObject.Find(unlockable).GetComponent<Unlockable>().Unlock();
                }
                else
                {
                    response = "It is already unlocked.";
                    lootType = LootType.NONE;
                }
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.COMBAT_STARTS:
                DialogOptionManager.current.ShowDialogWindow(false, null);
                DialogOptionManager.current.currentNPC.SetCombatTarget(GameManager.current.playerObject.transform);
                DialogOptionManager.current.currentNPC.ChangeState(NPCState.COMBAT);
                break;
        }

        switch (lootType)
        {
            case LootType.NONE:
                break;
            case LootType.GET:
                if(lootItem.GetQuantity() != 0)
                {
                    GameManager.current.playerObject.GetComponent<Player_Base>().LootItem(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                    HelpTextManager.current.AddLoot(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                }
                if (gold > 0)
                {
                    GameManager.current.playerObject.GetComponent<Player_Base>().LootGold(gold);
                    HelpTextManager.current.AddLoot("gold coins", gold);
                }
                break;
            case LootType.BUY_ITEM:
                GameManager.current.playerObject.GetComponent<Player_Base>().LootItem(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                HelpTextManager.current.AddLoot(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                GameManager.current.playerObject.GetComponent<Player_Base>().LoseGold(gold);
                HelpTextManager.current.RemoveLoot("gold coins", gold);
                break;
            case LootType.BUY_SERVICE:
                GameManager.current.playerObject.GetComponent<Player_Base>().LoseGold(gold);
                HelpTextManager.current.RemoveLoot("gold coins", gold);
                break;
            case LootType.LOSE:
                GameManager.current.playerObject.GetComponent<Player_Base>().LootItem(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                HelpTextManager.current.AddLoot(lootItem.GetItemType().GetItemName(), lootItem.GetQuantity());
                break;
            case LootType.BUY_AMMO:
                GameManager.current.playerObject.GetComponent<Player_Base>().LootAmmo(lootAmmo.GetAmmoType().GetAmmoType(), lootAmmo.GetQuantity());
                HelpTextManager.current.AddLoot(lootAmmo.GetAmmoType().GetAmmoType(), lootAmmo.GetQuantity());
                GameManager.current.playerObject.GetComponent<Player_Base>().LoseGold(gold);
                HelpTextManager.current.RemoveLoot("gold coins", gold);
                break;
        }
    }
}
