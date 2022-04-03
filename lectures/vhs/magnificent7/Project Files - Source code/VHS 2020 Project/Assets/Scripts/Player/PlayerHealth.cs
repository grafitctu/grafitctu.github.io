using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class PlayerHealth : MonoBehaviour
{
    [SerializeField]
    private int maxHealth = 100;

    [SerializeField]
    private int currentHealth = 100;

    [SerializeField] private float movementSpeed = 5f;
    [SerializeField] private float hurtSpeed = 2.5f;

    [SerializeField] private Animator overlayAnimator;

    [SerializeField] private GameObject injuryImg;

    public int GetCurrentHealth()
    {
        return currentHealth;
    }

    public void HealPlayer(int amount)
    {
        //SCREEN OVERLAY FOR A BIT PLS + SOUND AFTER DRINK PLS
        overlayAnimator.SetTrigger("HEAL");
        currentHealth = maxHealth;
        if (currentHealth > maxHealth)
            currentHealth = maxHealth;

        if (currentHealth < maxHealth)
        {
            injuryImg.SetActive(true);
            GetComponent<MoveVelocity>().SetMovementSpeed(hurtSpeed);
        }
        else
        {
            GetComponent<MoveVelocity>().SetMovementSpeed(movementSpeed);
            injuryImg.SetActive(false);
        }
    }

    public void DamagePlayer(int amount)
    {
        //SCREEN OVERLAY FOR A BIT PLS
        overlayAnimator.SetTrigger("DAMAGE");
        currentHealth -= amount;

        if (currentHealth < maxHealth)
        {
            GetComponent<MoveVelocity>().SetMovementSpeed(hurtSpeed);
            injuryImg.SetActive(true);
        }

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    public void Die()
    {
        //OR PLAY CINEMATIC "YOU DIED" PLS
        SceneManager.LoadScene(0);
        Debug.Log("Load last checkpoint after death");
    }
}
