using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ManageBlur : MonoBehaviour
{
    [SerializeField]
    public Material mat;
    [SerializeField]
    private float decreaseRate;
    [SerializeField]
    private float initDrunkness;
    private float drunkness;
    // Start is called before the first frame update
    void Start()
    {
        //mat.SetFloat("_Size", drunkness);
        drunkness = 0;
        
       // gameObject.GetComponent<Renderer>().sharedMaterial.SetFloat("_Size", 20);   
    }
    void drink()
    {
        drunkness += initDrunkness;        
    }
    // Update is called once per frame
    void Update()
    {
        if(drunkness >= 0)
        {
            mat.SetFloat("_Size", drunkness);
            drunkness-= decreaseRate;
        }
    }
}
