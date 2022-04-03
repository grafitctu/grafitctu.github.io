using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QuestPointer : MonoBehaviour
{
    [SerializeField]
    Transform target;
    [SerializeField]
    private Camera uiCamera;
   
    private Transform arrowTransform;
    private bool isActive = false;
    public float visibleRadius;

    private Vector3 targetPosition;
    // Start is called before the first frame update
    void Start()
    {
        if (visibleRadius.Equals(null)) visibleRadius = 5f;
        targetPosition = target.position;
        arrowTransform = GetComponent<Transform>();
    }
    void activate()
    {
        isActive = true;
        enable();
    }
    void enable()
    {
        GetComponent<SpriteRenderer>().enabled = true;
    }
    private void disable()
    {
        GetComponent<SpriteRenderer>().enabled = false;
    }
   
    // Update is called once per frame
    void Update()
    {        
        
        if (!isActive) return;
        Vector3 fromPosition = Camera.main.transform.position;       
                
        fromPosition.z = 0.0f;
        //if player is close enough, hide marker
        float dist = Vector3.Distance(targetPosition, fromPosition);
        if (dist < visibleRadius) disable();
        else enable();


        Vector3 dir = (targetPosition - fromPosition).normalized;
        float angle = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;
        if (angle < 0) angle += 360;

       
        arrowTransform.rotation = Quaternion.Euler(0, 0, angle);

        Vector3 targetScreenPoint = Camera.main.WorldToScreenPoint(targetPosition);
        bool isOffScreen = targetScreenPoint.x <= 0 || targetScreenPoint.x >= Screen.width || targetScreenPoint.y <= 0 || targetScreenPoint.y >= Screen.height;
        //Debug.Log(isOffScreen);
        if (isOffScreen)
        {
            //enable();
            Vector3 cappedTargetScreenPosition = targetScreenPoint;
            if (cappedTargetScreenPosition.x <= 0) cappedTargetScreenPosition.x = 15f;
            if (cappedTargetScreenPosition.x >= Screen.width) cappedTargetScreenPosition.x = Screen.width - 15f;
            if (cappedTargetScreenPosition.y <= 0) cappedTargetScreenPosition.y = 15f;
            if (cappedTargetScreenPosition.y >= Screen.height) cappedTargetScreenPosition.y = Screen.height - 15f;

             Vector3 pointerWorldPosition = Camera.main.ScreenToWorldPoint(cappedTargetScreenPosition);
             arrowTransform.position = pointerWorldPosition;
             arrowTransform.localPosition = new Vector3(arrowTransform.localPosition.x, arrowTransform.localPosition.y,0f);


        }
        else
        {
           // disable();
            Vector3 cappedTargetScreenPosition = targetScreenPoint;
            Vector3 pointerWorldPosition = Camera.main.ScreenToWorldPoint(cappedTargetScreenPosition);
            arrowTransform.position = pointerWorldPosition;
            arrowTransform.localPosition = new Vector3(arrowTransform.localPosition.x, arrowTransform.localPosition.y, 0f);
        }
    }
}
