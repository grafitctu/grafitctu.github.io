using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.SceneManagement;
using TMPro;

public class Player_Base : MonoBehaviour
{
    public Camera playerCamera = null;

    [SerializeField]
    private float goldRicingTime = 2.0f;
    [SerializeField]
    private GameObject goldRicingBowl = null;

    [SerializeField] private int goldAmount = 0;
    [SerializeField] private int drinkAmount = 0;

    public Animator playerMovementAnimator = null;
    [SerializeField] private float gamblingTime = 2.0f;
    [SerializeField] private GameObject questLogWindow = null;
    [SerializeField] private GameObject questPrefabForLog = null;
    [SerializeField] private GameObject questLogEmptyObject = null;
    [SerializeField] private TextMeshProUGUI goldAmountText = null;

    [SerializeField] private GameObject gamblingDie = null;

    [SerializeField] private bool firstDrink = true;

    public bool canMove = true;
    public bool canInteract = true;

    private bool isDrinking = false;
    private bool firstMove = true;
    private bool firstWeapon = true;

    [SerializeField] private GameObject playerMug = null;

    public void BuildingAnimation()
    {
        playerMovementAnimator.SetTrigger("DOOR");
    }

    private void FadeIn(SceneName sceneName)
    {
        GameManager.current.PlayFadeIn();
    }

    private void OnEnable()
    {
        if (GameManager.current)
        {
            GameManager.current.PlayFadeIn();
        }

        TipManager.current.ShowTip("Movement", "Move with WASD or Arrow keys.");
    }

    private void Start()
    {
        SceneDirector.current.onSceneChanged.AddListener(FadeIn);
        FadeIn(SceneName.SHERIFF);
        IntroEndGameTimer.current.StartEndGameTimer();
        GameManager.current.playerObject = this.gameObject;
        playerCamera = GameManager.current.playerObject.GetComponentInChildren<Transform>().GetComponentInChildren<Camera>();

        
    }

    public void StopWalkingAnimation()
    {
        playerMovementAnimator.SetBool("isWalking", false);
    }

    public void PlayAnimation(Vector3 movement)
    {
        if (playerMovementAnimator && canMove)
        {
            if(movement != Vector3.zero)
            {
                //Play walking sound
                playerMovementAnimator.SetBool("isWalking",true);
            }
            else
                playerMovementAnimator.SetBool("isWalking", false);
        }
    }

    private void Update()
    {
	    if ((Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.UpArrow)) && firstMove)
        {
            firstMove = false;
            TipManager.current.ShowTip("Interaction", "Press [E] to interact with objects and characters.");
        }

        if (Input.GetKeyDown(KeyCode.Alpha1) || Input.GetKeyDown(KeyCode.Plus))
        {
            GetComponent<PlayerWeapons>().ChangeWeapon(1);
        }

        if (Input.GetKeyDown(KeyCode.Alpha2) || Input.GetKeyDown(KeyCode.None + 160))
        {
            GetComponent<PlayerWeapons>().ChangeWeapon(2);
        }

        if (Input.GetKeyDown(KeyCode.Alpha4) || Input.GetKeyDown(KeyCode.None + 162))
        {
            Drink();
        }

        if (Input.GetMouseButtonDown(0))
        {
            GetComponent<PlayerWeapons>().ShootCurrentWeapon();
        }

        if (Input.GetKeyDown(KeyCode.E) && TipManager.current.TipShown())
        {
            StartCoroutine(ConfirmTip());
        }

        if (Input.GetKeyDown(KeyCode.Tab))
        {
            ShowQuestLog();
        }

        if (Input.GetKeyUp(KeyCode.Tab))
        {
            HideQuestLog();
        }
        /*
        if (Input.GetKeyDown(KeyCode.T))
        {
            Time.timeScale = 20f;
        }

        if (Input.GetKeyUp(KeyCode.T))
        {
            Time.timeScale = 1f;
        }

        if (Input.GetKeyDown(KeyCode.Z))
        {
            Time.timeScale = 0.01f;
        }

        if (Input.GetKeyUp(KeyCode.Z))
        {
            Time.timeScale = 1f;
        }
        */
    }

    private IEnumerator ConfirmTip()
    {
        yield return new WaitForEndOfFrame();
        TipManager.current.HideTip();
    }


    private void ShowQuestLog()
    {
        if(QuestTracker.current.GetActiveQuests().Length == 0)
        {
            Instantiate(questLogEmptyObject, questLogWindow.transform);
        }
        else
        {
            foreach (Quest quest in QuestTracker.current.GetActiveQuests())
            {
                GameObject newQuest = Instantiate(questPrefabForLog, questLogWindow.transform);
                newQuest.transform.GetChild(0).GetComponent<TextMeshProUGUI>().text = quest.GetQuestTitle();
                newQuest.transform.GetChild(1).GetComponent<TextMeshProUGUI>().text = quest.GetQuestDescription();
            }
        }

        goldAmountText.text = goldAmount + " gold";

        questLogWindow.SetActive(true);
    }

    private void HideQuestLog()
    {
        questLogWindow.SetActive(false);

        for (int i = 1; i < questLogWindow.transform.childCount; i++)
        {
            Destroy(questLogWindow.transform.GetChild(i).gameObject);
        }
    }

    public int GetGold()
    {
        return goldAmount;
    }

    public void LootGold(int golds)
    {
        goldAmount += golds;
    }

    public void LoseGold(int golds)
    {
        goldAmount -= golds;
        if (goldAmount < 0)
        {
            goldAmount = 0;
        }
    }

    public void LootItem(string itemName, int quantity)
    {
        Debug.Log("Player looted item: " + itemName);
        switch (itemName)
        {
            case "Beer":
                if (firstDrink)
                {
                    TipManager.current.ShowTip("Drink", "You can heal yourself by drinking. Press [4] to drink.");
                    firstDrink = false;
                }
                drinkAmount += quantity;
                break;
            case "Shotgun":
                LootWeapon(2);
                break;
            default:
                break;
        }
    }

    private void Drink()
    {
        
            
        if (!isDrinking && drinkAmount > 0)
        {
            Debug.Log("Drinking");
            HelpTextManager.current.ShowErrorMessage("The drink has healed you.");
            drinkAmount--;
            isDrinking = true;
            playerMug.SetActive(true);
            playerMovementAnimator.SetLayerWeight(playerMovementAnimator.GetLayerIndex("Drink"), 1.0f);
            StartCoroutine(StopDrinking());
        }
    }

    private IEnumerator StopDrinking()
    {
        yield return new WaitForSeconds(4f);
        playerMug.SetActive(false);
        playerMovementAnimator.SetLayerWeight(playerMovementAnimator.GetLayerIndex("Drink"), 0.0f);
        GetComponent<PlayerHealth>().HealPlayer(10);
        isDrinking = false;
    }

    public void LootWeapon(int weapon)
    {
        if (firstWeapon)
        {
            TipManager.current.ShowTip("Weapons","Switch between weapons with [1] and [2]. \n You can switch back to unarmed by choosing the equipped weapon one more time.");
            firstWeapon = false;
        }
            
        GetComponent<PlayerWeapons>().ownership[weapon] = true;
    }

    public void LootAmmo(string weaponName, int quantity)
    {
        Debug.Log("Looting ammo: " + weaponName);
        switch (weaponName)
        {
            case "Colt .45":
                GetComponent<PlayerWeapons>().AddAmmo(1, quantity);
                break;
            case "Shell 4.5mm":
                GetComponent<PlayerWeapons>().AddAmmo(2, quantity);
                break;
            default:
                break;
        }
    }

    public IEnumerator RiceGold(Camera goldRicingCamera, int timesRiced)
    {
        //StopMovement
        GetComponent<MoveVelocity>().StopMoving();
        //Stop turning
        GetComponent<CameraLookWithMouse>().enabled = false;
        //ChangeCamera
        playerCamera.gameObject.SetActive(false);
        goldRicingCamera.gameObject.SetActive(true);
        //PlayAnimation
        playerMovementAnimator.SetTrigger("GoldRicing");
        //Show gold rice bowl
        goldRicingBowl.SetActive(true);
        //Start Timer
        yield return new WaitForSeconds(goldRicingTime);
        //Generate riced gold
        int amountRiced = 0;
        switch (timesRiced)
        {
            case 0:
                amountRiced = Random.Range(20,50);
                break;
            case 1:
                amountRiced = Random.Range(10, 30);
                break;
            case 2:
                amountRiced = Random.Range(1, 20);
                break;
            default:
                break;
        }

        //StartMovement
        GetComponent<MoveVelocity>().StartMoving();
        GetComponent<CameraLookWithMouse>().enabled = true;
        //ChangeCamera
        goldRicingCamera.gameObject.SetActive(false);
        playerCamera.gameObject.SetActive(true);
        //LootRandomGold
        if (amountRiced != 0)
        {
            HelpTextManager.current.AddLoot("gold coins", amountRiced);
            GameManager.current.playerObject.GetComponent<Player_Base>().LootGold(amountRiced);
        }
        else
            HelpTextManager.current.AddLoot("worthless river stones", Random.Range(1, 12));
        //Hide gold rice bowl
        goldRicingBowl.SetActive(false);
    }

    public IEnumerator Gamble(Camera gamblingCamera)
    {
        //StopMovement
        GetComponent<MoveVelocity>().StopMoving();
        //ChangeCamera
        
        playerCamera.gameObject.SetActive(false);
        gamblingCamera.gameObject.SetActive(true);
        //PlayAnimation
        playerMovementAnimator.SetTrigger("Gambling");
        GetComponent<CameraLookWithMouse>().enabled = false;
        //Show gold rice bowl
        gamblingDie.SetActive(true);
        //Start Timer
        yield return new WaitForSeconds(gamblingTime);
        //Generate riced gold
        int amountGambled = Random.Range(-10, 10);
        GetComponent<CameraLookWithMouse>().enabled = true;
        //StartMovement
        GetComponent<MoveVelocity>().StartMoving();
        //ChangeCamera
        gamblingCamera.gameObject.SetActive(false);
        playerCamera.gameObject.SetActive(true);
        //LootRandomGold
        if (amountGambled > 0)
        {
            HelpTextManager.current.AddLoot("gold coins", amountGambled);
            GameManager.current.playerObject.GetComponent<Player_Base>().LootGold(amountGambled);
        }
        else if (amountGambled < 0)
        {
            HelpTextManager.current.RemoveLoot("gold coins", -amountGambled);
            GameManager.current.playerObject.GetComponent<Player_Base>().LoseGold(-amountGambled);
        }
        else
        {
            HelpTextManager.current.ShowErrorMessage("You came out even");
        }
        //Hide gold rice bowl
        gamblingDie.SetActive(false);
    }
}
