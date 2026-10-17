"""Hash-cached Demucs vocal separation using an existing local model cache."""
from pathlib import Path
import hashlib,json
import numpy as np
import soundfile as sf

def separate_vocals(source,output,model_cache):
 source,output,model_cache=map(Path,(source,output,model_cache));output.mkdir(parents=True,exist_ok=True)
 digest=hashlib.sha256(source.read_bytes()).hexdigest();meta=output/'separation.json';vocal=output/'vocals.wav'
 if meta.exists() and vocal.exists() and json.loads(meta.read_text())['source_sha256']==digest:return vocal
 checkpoint=model_cache/'torchaudio/models/hdemucs_high_trained.pt';assert checkpoint.exists(),f'Missing local Demucs checkpoint: {checkpoint}'
 import torch,torchaudio
 torch.set_num_threads(4);torch.hub.set_dir(str(model_cache));bundle=torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS;model=bundle.get_model().eval()
 data,sr=sf.read(source,dtype='float32',always_2d=True);x=torch.from_numpy(data.T.copy())
 if sr!=bundle.sample_rate:x=torchaudio.functional.resample(x,sr,bundle.sample_rate)
 sr=bundle.sample_rate;mean,std=x.mean(),x.std().clamp_min(1e-6);x=(x-mean)/std
 size,overlap=8*sr,sr;result=torch.zeros((4,2,x.shape[-1]));weight=torch.zeros(x.shape[-1])
 for start in range(0,x.shape[-1],size-overlap):
  end=min(start+size,x.shape[-1])
  with torch.inference_mode():stems=model(x[:,start:end].unsqueeze(0))[0]*std
  fade=torch.ones(end-start);n=min(overlap,len(fade))
  if start:fade[:n]*=torch.linspace(0,1,n)
  if end<x.shape[-1]:fade[-n:]*=torch.linspace(1,0,n)
  result[:,:,start:end]+=stems*fade;weight[start:end]+=fade
  print(f'Demucs {end/sr:.1f}/{x.shape[-1]/sr:.1f}s',flush=True)
  if end==x.shape[-1]:break
 result/=weight.clamp_min(1e-8)
 for i,name in enumerate(model.sources):sf.write(output/(name+'.wav'),result[i].numpy().T,sr,subtype='FLOAT')
 meta.write_text(json.dumps({'source_sha256':digest,'sample_rate':sr,'method':'HDEMUCS_HIGH_MUSDB_PLUS overlap-add 8s/1s','sources':model.sources},indent=2))
 return vocal
