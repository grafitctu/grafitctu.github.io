using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Cook : MonoBehaviour
{
    public FoodStorage foodStorage;
    public int resourcesNeeded;
    private string state = "READY";
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (state == "COOKING") return;
        if (foodStorage.UseResources(resourcesNeeded))
        {
            StartCoroutine(CookingCo());
        }
    }
    private IEnumerator CookingCo()
    {
        state = "COOKING";
        yield return new WaitForSeconds(5f);
        foodStorage.AddFood(1);
        state = "READY";
    }
}
