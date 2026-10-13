"""Known text per-character Whisper cross-attention DTW, for isolated tracks of at most 30 seconds."""
from faster_whisper.audio import decode_audio, pad_or_trim

def align_text(model, make_tokenizer, audio_path, text):
    tokenizer = make_tokenizer()
    tokens = [token for ch in text for token in tokenizer.encode(ch)]
    audio = decode_audio(str(audio_path), sampling_rate=16000)
    if len(audio) > 30 * 16000:
        raise ValueError('aligner requires a <=30s track')
    features = model.feature_extractor(audio)
    encoder = model.encode(pad_or_trim(features))
    aligned = model.find_alignment(tokenizer, [tokens], encoder, min(len(audio) // 160, 3000))[0]
    chars = [{'ch': w['word'], 'start': round(float(w['start']), 3),
              'end': round(float(w['end']), 3), 'probability': round(float(w['probability']), 4)} for w in aligned]
    assert ''.join(c['ch'] for c in chars) == text, f'对齐文本不一致: {audio_path}'
    assert all(len(c['ch']) == 1 for c in chars)
    return chars, round(len(audio) / 16000, 3)
