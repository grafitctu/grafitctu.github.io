using UnityEngine;
using System.Collections;

[CreateAssetMenu(fileName = "Ammo", menuName = "CustomObjects/Weapon")]
public class Weapon : ScriptableObject
{
    [SerializeField]
    private string weaponName = "";

    [SerializeField]
    private int weaponDamage = 0;

    [SerializeField]
    private Ammo ammo = null;

    [SerializeField]
    private AudioClip fireSound = null;

    [SerializeField]
    private ParticleSystem muzzle = null;

    [SerializeField]
    private AudioClip reloadSound = null;

    [SerializeField]
    private float reloadTime = 0f;

    [SerializeField]
    private float timeBetweenShots = 0f;

    [SerializeField]
    private float weaponRange = 0f;

    public string GetWeaponName()
    {
        return weaponName;
    }

    public float GetWeaponRange()
    {
        return weaponRange;
    }

    public string GetAmmoType()
    {
        return ammo.GetAmmoType();
    }

    public AudioClip GetFireSound()
    {
        return fireSound;
    }

    public AudioClip GetReloadSound()
    {
        return reloadSound;
    }

    public float GetReloadTime()
    {
        return reloadTime;
    }

    public float GetTimeBetweenShots()
    {
        return timeBetweenShots;
    }

    public Ammo GetAmmo()
    {
        return ammo;
    }

    public int GetWeaponDamage()
    {
        return weaponDamage;
    }
}
