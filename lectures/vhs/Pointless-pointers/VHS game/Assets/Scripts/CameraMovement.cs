using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraMovement : MonoBehaviour
{
    public Transform target;
    public float smoothing;
    public Vector2 maxPosition;
    public Vector2 minPositions;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    // late update se volá později než update
    // tím se zajistí, že hráč bude zaktualizovaný ve chvíli, kdy tu s ním pracujeme
    void LateUpdate()
    {
        if (transform.position != target.position)
        {
            Vector3 targetPosition = new Vector3(
                target.position.x, target.position.y, transform.position.z
                );

            targetPosition.x = Mathf.Clamp(targetPosition.x, minPositions.x, maxPosition.x);
            targetPosition.y = Mathf.Clamp(targetPosition.y, minPositions.y, maxPosition.y);

            // lineární posun k cíli, který si zjistí vzdálenost a pak uměrnou rychlostí se přibližuje
            transform.position = Vector3.Lerp(transform.position, targetPosition, smoothing);
        }
    }
}
