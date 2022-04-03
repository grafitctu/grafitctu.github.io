using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MusicController : MonoBehaviour
{
    private AudioSource source;
    // Start is called before the first frame update
    void Start()
    {
        source = GetComponent<AudioSource>();        
    }
    public void Play()
    {
        source.volume = 1;
        source.Play();
    }
    public IEnumerator Stop()
    {
        while (source.volume > 0)
        {
            source.volume -= 1 * Time.deltaTime / 3;

            yield return null;
        }
        source.Stop();        
    }


}
