using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager current;

    public GameObject playerObject = null;

    public int bountyCount = 3;

    public GameObject[] bountiesToSpawn = null;

    private int bountiesLeft = 3;

    private void Start()
    {
        TimeManager.current.onDayPassed.AddListener(TryToSpawnBounty);
    }

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

    public void PlayFadeIn()
    {
        UIManager.current.fadePanels.GetComponent<Animator>().SetTrigger("FadeOut");
    }

    public void TookBounty()
    {
        bountyCount--;
    }

    public void SpawnedBounty()
    {
        bountyCount++;
    }

    public void TryToSpawnBounty()
    {
        if (bountyCount < 3 && bountiesLeft > 0)
        {
            bountiesToSpawn[3 - bountiesLeft].SetActive(true);
            bountiesLeft--;
            SpawnedBounty();
        }
    }
}
