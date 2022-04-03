using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FoodStorage : MonoBehaviour
{
    private int resources = 0;
    private int food = 0;
    
    // Start is called before the first frame update
    void Start()
    {
        
    }
    
    // Update is called once per frame
    void Update()
    {
        
    }
    public bool AddResouores(int ammount)
    {
        resources += ammount;
       // Debug.Log("Resources: " + resources);
        return true;
    }
    public bool UseResources(int ammount)
    {
        if (ammount > resources)
        {
           // Debug.Log("Not Enough Resources");
            return false;
        }
        resources -= ammount;
        //Debug.Log("Resources: " + resources);
        return true;
    }
    public bool AddFood(int ammount)
    {        
        food += ammount;
       // Debug.Log("FOOD: " + food);
        return true;
    }
    public bool UseFood(int ammount)
    {
        if (ammount > food)
        {
            return false;
        }
        food -= ammount;
       // Debug.Log("Food: " + food);
        return true;
    }

}
