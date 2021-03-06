using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public interface IInteractible
{
    void Interact();
    string GetName();
    void SetInteractible(bool val);
}
