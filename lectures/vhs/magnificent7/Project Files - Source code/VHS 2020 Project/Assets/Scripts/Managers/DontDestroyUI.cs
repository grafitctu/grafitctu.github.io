using UnityEngine;

public class DontDestroyUI : MonoBehaviour
{
    public static DontDestroyUI current;

    private void Awake()
    {
        if (current == null)
        {
            current = this;
            DontDestroyOnLoad(this.gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
}
