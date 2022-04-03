using System;
using UnityEngine;

public class GameEvents : MonoBehaviour
{
    public static GameEvents current;

    private void Awake()
    {
        if (current == null)
        {
            current = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public event Action<Objective> onNPCFound;

    public void NPCFound(Objective objective)
    {
        onNPCFound?.Invoke(objective);
    }

    public event Action<Objective> onNPCKilled;

    public void NPCKilled(Objective objective)
    {
        onNPCKilled?.Invoke(objective);
    }

    public event Action<Objective> onItemDelivered;

    public void ItemDelivered(Objective objective)
    {
        onItemDelivered?.Invoke(objective);
    }

    public event Action<Objective> onAssisted;

    public void Assisted(Objective objective)
    {
        onAssisted?.Invoke(objective);
    }

    public event Action<Quest> onQuestTurnedIn;

    public void QuestTurnedIn(Quest quest)
    {
        onQuestTurnedIn?.Invoke(quest);
    }

    public event Action<Quest> onQuestAccepted;

    public void QuestAccepted(Quest quest)
    {
        onQuestAccepted?.Invoke(quest);
    }

    public event Action onLootBoxActivated;

    public void LootBoxActivated()
    {
        onLootBoxActivated?.Invoke();
    }

    public event Action onPlayerWeaponWithdrawn;

    public void PlayerWeaponWithdrawn()
    {
        onPlayerWeaponWithdrawn?.Invoke();
    }


}
