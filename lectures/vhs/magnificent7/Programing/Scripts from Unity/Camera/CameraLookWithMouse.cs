using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraLookWithMouse : MonoBehaviour
{
    [SerializeField] private string mouseXInputName = "", mouseYInputName = "";
    [SerializeField] private float mouseSensitivity = 0f;
    [SerializeField] private Camera playerCamera = null;
    [SerializeField] private Transform headTransform = null;
    [SerializeField] private float yOffset = 0f;

    [SerializeField] private bool isLocked = false;


    [SerializeField] private float xAxisClamp = 0f;

    private float xRotation = 0f;

    private void Awake()
    {
        LockCursor();
    }

    private void Start()
    {
        xRotation = playerCamera.transform.localRotation.x;
    }

    private void LockCursor()
    {
        Cursor.lockState = CursorLockMode.Locked;
    }

    private void Update()
    {
        if (!isLocked)
        {
            CameraRotation();
            CameraHeight();
        }
    }

    private void CameraRotation()
    {
        float mouseX = Input.GetAxis(mouseXInputName) * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis(mouseYInputName) * mouseSensitivity * Time.deltaTime;

        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f);

        playerCamera.transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
        transform.Rotate(Vector3.up * mouseX);
    }

    private void CameraHeight()
    {
        playerCamera.transform.position = new Vector3(playerCamera.transform.position.x,headTransform.position.y + yOffset,playerCamera.transform.position.z);
    }

    public void LockCamera()
    {
        isLocked = true;
    }

    public void UnlockCamera()
    {
        isLocked = false;
    }
}
