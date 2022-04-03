using System.Collections.Generic;
using UnityEngine;

public class NotificationItem
{

    public NotificationItem(string lootText, int lootQuantity, bool gain)
    {
        if (gain)
            this.verbText = "Looted";
        else
            this.verbText = "Lost";
        this.nounText = lootText + " x " + lootQuantity.ToString();
    }

    public NotificationItem(string errorMessage)
    {
        this.verbText = errorMessage;
    }

    public NotificationItem(QuestState questState, Quest quest)
    {
        switch (questState)
        {
            case QuestState.NEW:
                this.verbText = "Unlocked";
                break;
            case QuestState.ACCEPTED:
                this.verbText = "Accepted";
                break;
            case QuestState.COMPLETED:
                this.verbText = "Completed";
                break;
            case QuestState.DONE:
                this.verbText = "Turned in";
                
                break;
        }
        this.nounText = quest.GetQuestTitle();
    }

    private string verbText;
    private string nounText;

    public string GetNotificationText()
    {
        return verbText + " " + nounText;
    }
}

public class RollingText : MonoBehaviour
{
    private static List<NotificationItem> notificationQueue = new List<NotificationItem>();

    public GameObject notification;

    public bool isFloating = false;

    public static RollingText current;

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

    public void AddLoot(string lootName, int lootQuantity)
    {
        ShowNotification(new NotificationItem(lootName, lootQuantity, true));
    }

    public void RemoveLoot(string lootName, int lootQuantity)
    {
        ShowNotification(new NotificationItem(lootName, lootQuantity, false));
    }


    public void ShowErrorMessage(string errorMessage)
    {
        ShowNotification(new NotificationItem(errorMessage));
    }

    public void QuestChanged(QuestState questState, Quest quest)
    {
        ShowNotification(new NotificationItem(questState, quest));
    }

    public static void ShowNotification(NotificationItem item)
    {
        //Play notification sound
        notificationQueue.Add(item);
    }

    private void Update()
    {
        if (!isFloating && notificationQueue.Count > 0)
        {
            NotificationItem item = notificationQueue[0];
            notificationQueue.RemoveAt(0);
            notification.GetComponent<Notification>().content = item.GetNotificationText();
            notification.GetComponent<Notification>().Setup();
            Float();
        }
    }

    private void Float()
    {
        isFloating = true;
        notification.GetComponent<Notification>().Float();
    }
}
