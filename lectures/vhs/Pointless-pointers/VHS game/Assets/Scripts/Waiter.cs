using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
using Fungus;

public enum WaiterState
{
    WaitingForFood,
    Serving,
    Returning,
    ServingPlayerStory,
    ServingPlayerRandom, 
    ReturningFromPlayer
}
public enum Drinks
{
    Beer,
    Wine,
    Whisky
}
public class Waiter : WalkingNPC
{
    //path
    public Transform[] tables;
    public Transform storageLocation;   
    public bool cycling = false;
    int numberOfServingTable = 0;
    

    //serve food stuff
    public FoodStorage foodStorage;
    private WaiterState state = WaiterState.Returning;
    public GameObject drinkPrefab;

   public void Stop()
    {
        this.setStopped(true);
    }
    public void Resume()
    {
        this.setStopped(false);
    }
    // Update is called once per frame
    public override void FixedUpdate()
    {
        //Debug.Log(numberOfServingTable);
        if (state == WaiterState.WaitingForFood)
        {
            CheckFood();
        }

        else
        {
            MoveToTarget();
        }
    }
    void CheckFood()
    {
        if (foodStorage.UseFood(1))
        {
            state = WaiterState.Serving;
            GetComponent<Animator>().SetBool("moving", true);
            //Debug.Log("New state: " + state);
        }
    }
   
    public override void ActionOnPathEnd()
    {
        Debug.Log(this.state);
        if (this.state == WaiterState.Serving)
        {
            this.state = WaiterState.Returning;
            // GetComponent<Animator>().SetBool("moving", false);
            //Z nejakeho duvodu je tohle potreba...
            SetTarget(storageLocation);
            seeker.StartPath(rb.position, storageLocation.position, OnPathComplete);
        }
        else if (this.state == WaiterState.Returning)
        {            
            this.state = WaiterState.WaitingForFood;
            GetComponent<Animator>().SetBool("moving", false);
            numberOfServingTable = (numberOfServingTable + 1) % (tables.Length);
            //Z nejakeho duvodu je tohle potreba...
            SetTarget(tables[numberOfServingTable]);
            seeker.StartPath(rb.position, tables[numberOfServingTable].position, OnPathComplete);
        }
        else if (this.state == WaiterState.ServingPlayerStory)
        {
            if(target.gameObject.tag == "PlayerOffset")
            {
                GetComponent<Animator>().SetBool("moving", false);
                setStopped(true);                
                GetComponent<Flowchart>().ExecuteBlock("Service");
                GetComponent<Flowchart>().SetBooleanVariable("first", false);
            }
            else if (target == storageLocation)
            {
                GoToPlayerStory();                
            }
        }
        else if (this.state == WaiterState.ServingPlayerRandom)
        {
            if (target.gameObject.tag == "PlayerOffset")
            {
                //create prefab
                Instantiate(drinkPrefab, this.transform.position, Quaternion.identity);
                this.ResumeCycle();
            }
            else if (target == storageLocation)
            {
                GoToPlayerRandom();
            }
        }

    }
    public void GoToPlayerRandom()
    {
        this.Stop();
        this.state = WaiterState.ServingPlayerRandom;        
        this.SetTarget(GameObject.FindWithTag("PlayerOffset").transform);
        seeker.StartPath(rb.position, target.position, OnPathComplete);
        this.Resume();
    }
    public void GoToPlayerStory()
    {        
        this.state = WaiterState.ServingPlayerStory;
        this.SetTarget(GameObject.FindWithTag("PlayerOffset").transform);
        seeker.StartPath(rb.position, target.position, OnPathComplete);
    }
    public void BringOtherStuff()
    {
        this.Stop();
        this.state = WaiterState.ServingPlayerRandom;
        this.SetTarget(storageLocation);
        GetComponent<Animator>().SetBool("moving", true);
        setStopped(false);
        seeker.StartPath(rb.position, target.position, OnPathComplete);
        this.Resume();
    }
    public void BringWine()
    {        
        this.state = WaiterState.ServingPlayerStory;
        this.SetTarget(storageLocation);
        GetComponent<Animator>().SetBool("moving", true);
        setStopped(false);
        seeker.StartPath(rb.position, target.position, OnPathComplete);
    }
    public void ResumeCycle()
    {
        this.SetTarget(storageLocation);        
        this.state = WaiterState.Returning;
        GetComponent<Animator>().SetBool("moving", true);
        setStopped(false);
    }
}

