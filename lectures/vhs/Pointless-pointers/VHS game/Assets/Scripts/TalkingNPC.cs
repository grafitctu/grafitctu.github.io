using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TalkingNPC : MonoBehaviour
{
   
    public RectTransform dialogue;  
    public RectTransform canvasRect;
    private bool talking = false;
    // Start is called before the first frame update
    void Start()
    {       


    }   

    // Update is called once per frame    
    private void Update()
    {
        if (talking)
            SetDialogue();       
    }
    public void setTalking()
    {
        this.talking = true;
        
    }
    public void setNotTalking()
    {
        this.talking = false;
    }
  

    Vector2 WorldToCanvasPosition(Canvas canvas, RectTransform canvasRect, Camera camera, Vector3 position)
    {

        Vector2 screenPoint = RectTransformUtility.WorldToScreenPoint(camera, position);
        Vector2 result;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(canvasRect, screenPoint, canvas.renderMode == RenderMode.ScreenSpaceOverlay ? null : camera, out result);

        return canvas.transform.TransformPoint(result);
    }

    public void SetDialogue()
    {
        //NIKDY VÍC!!!!!!
        Vector3 offset = new Vector3(-1.4f, 1.1f, 0);

        Vector2 ViewportPosition = Camera.main.WorldToViewportPoint(transform.position + offset);
        Vector2 WorldObject_ScreenPosition = new Vector2(
        ((ViewportPosition.x * canvasRect.sizeDelta.x) - (canvasRect.sizeDelta.x * 0.5f)),
        ((ViewportPosition.y * canvasRect.sizeDelta.y)));

        //now you can set the position of the ui element
        dialogue.anchoredPosition = (WorldObject_ScreenPosition);
    }  

}
