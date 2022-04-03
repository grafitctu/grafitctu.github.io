using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class PlayerWeapons : MonoBehaviour
{
	public bool[] ownership = new bool[3];
	[SerializeField]
	private Weapon[] weapons = new Weapon[3];
	[SerializeField]
	private int[] ammunition = new int[3];
	[SerializeField]
	private int currentWeaponIndex = 0;

	[SerializeField]
	private TextMeshProUGUI ammoTypeText = null;
	[SerializeField]
	private TextMeshProUGUI ammoAmountText = null;
	[SerializeField]
	private TextMeshProUGUI weaponNameText = null;
	[SerializeField]
	private Image weaponGraphics = null;
	[SerializeField]
	private Sprite[] weaponGraphicsArray = null;
	[SerializeField]
	private GameObject weaponToolbar = null;
	[SerializeField]
	private GameObject[] WeaponObjects = null;

	[SerializeField]
	private GameObject crosshair = null;

	[SerializeField]
	private float timeToHideToolbar = 3.0f;

	[SerializeField]
	private AudioSource changeWeaponSource;

	public GameObject bloodParticles;
	public GameObject debrisParticles;

	private void Awake()
	{
		ownership[0] = true;
	}

	public void ChangeWeapon(int weaponIndex)
	{
		if (ownership[weaponIndex] == false)
			return;

		int lastIndex = currentWeaponIndex;

		if (weaponIndex == currentWeaponIndex)
		{
			currentWeaponIndex = 0;
			SetCurrentWeapon(currentWeaponIndex, lastIndex);
			return;
		}

		currentWeaponIndex = weaponIndex;

		SetCurrentWeapon(currentWeaponIndex, lastIndex);

		if (changeWeaponSource)
		{
			changeWeaponSource.clip = SoundManager.Current.ChangeWeapon;
			changeWeaponSource.time = 0;
			changeWeaponSource.Play();
		}

	}

	private void SetCurrentWeapon(int weaponIndex, int lastIndex)
	{
		if (weaponIndex != 0)
		{
			ammoTypeText.text = weapons[weaponIndex].GetAmmoType();
			ammoAmountText.text = ammunition[weaponIndex].ToString();
			weaponNameText.text = weapons[weaponIndex].GetWeaponName();
			weaponGraphics.sprite = weaponGraphicsArray[weaponIndex];
			weaponGraphics.gameObject.SetActive(true);
		}
		else
		{
			ammoTypeText.text = "";
			ammoAmountText.text = "";
			weaponNameText.text = "";
			weaponGraphics.gameObject.SetActive(false);
		}

		weaponToolbar.SetActive(true);
		StartCoroutine(HideToolbar());
		if (lastIndex != 0)
			WeaponObjects[lastIndex].SetActive(false);

		//Play Swap Sound Here use index as switch

		if (weaponIndex == 1)
		{
			crosshair.SetActive(true);
			GetComponent<Player_Base>().playerMovementAnimator.SetLayerWeight(GetComponent<Player_Base>().playerMovementAnimator.GetLayerIndex("Pistol"), 1.0f);
			GetComponent<Player_Base>().playerMovementAnimator.SetLayerWeight(GetComponent<Player_Base>().playerMovementAnimator.GetLayerIndex("Rifle"), 0.0f);
		}

		if (weaponIndex == 2)
		{
			crosshair.SetActive(true);
			GetComponent<Player_Base>().playerMovementAnimator.SetLayerWeight(GetComponent<Player_Base>().playerMovementAnimator.GetLayerIndex("Pistol"), 0.0f);
			GetComponent<Player_Base>().playerMovementAnimator.SetLayerWeight(GetComponent<Player_Base>().playerMovementAnimator.GetLayerIndex("Rifle"), 1.0f);
		}

		if (weaponIndex == 0)
		{
			crosshair.SetActive(false);
			GetComponent<Player_Base>().playerMovementAnimator.SetLayerWeight(GetComponent<Player_Base>().playerMovementAnimator.GetLayerIndex("Pistol"), 0.0f);
			GetComponent<Player_Base>().playerMovementAnimator.SetLayerWeight(GetComponent<Player_Base>().playerMovementAnimator.GetLayerIndex("Rifle"), 0.0f);
		}

		if (weaponIndex != 0)
		{
			WeaponObjects[weaponIndex].SetActive(true);
			GameEvents.current.PlayerWeaponWithdrawn();
		}
	}

	private IEnumerator HideToolbar()
	{
		yield return new WaitForSeconds(timeToHideToolbar);
		weaponToolbar.SetActive(false);
	}

	public void AddAmmo(int index, int quantity)
	{
		ammunition[index] += quantity;
	}

	public void ShootCurrentWeapon()
	{
		if (currentWeaponIndex != 0)
		{
			if (ammunition[currentWeaponIndex] > 0)
			{
				GetComponent<AudioSource>().PlayOneShot(weapons[currentWeaponIndex].GetFireSound());
				ammunition[currentWeaponIndex]--;
				Ray rayOrigin = GetComponent<Player_Base>().playerCamera.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0.0f));
				RaycastHit shotHit;
				if (Physics.Raycast(rayOrigin, out shotHit, weapons[currentWeaponIndex].GetWeaponRange()))
				{
					Debug.DrawLine(rayOrigin.origin, rayOrigin.direction * weapons[currentWeaponIndex].GetWeaponRange());
					NPC npcHit = shotHit.collider.GetComponent<NPC>();

					if (npcHit)
					{
						Debug.Log("Player has shot " + npcHit.GetName());
						npcHit.Damage(weapons[currentWeaponIndex].GetWeaponDamage(), gameObject);
						Instantiate(bloodParticles, shotHit.point, Quaternion.LookRotation(shotHit.normal, Vector3.up));
					}
					else
					{
						Instantiate(debrisParticles, shotHit.point, Quaternion.LookRotation(shotHit.normal, Vector3.up));
					}
				}
			}
			else
			{
				HelpTextManager.current.ShowErrorMessage("I'm out of ammo.");
			}
		}
	}

	public void ReloadCurrentWeapon()
	{
		//Animation
		//ReloadSound
		//Ammo = ammo full
	}

}
