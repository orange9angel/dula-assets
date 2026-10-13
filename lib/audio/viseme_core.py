"""Reusable V17 Mandarin continuous viseme builder. Promoted from the validated story implementation."""
import re
STEP = .01
VOWELS = {'a': (.9, .1, 0), 'o': (.7, -.1, 1), 'e': (.55, .2, 0),
          'i': (.35, .35, 0), 'u': (.3, -.15, 1)}
PURSE = {'a': 0, 'o': 0, 'e': 0, 'i': 0, 'u': 1}
STOPS = {'b', 'p', 'm'}
FRICATIVE_F = 'f'
SIBILANTS = {'s', 'z', 'c', 'sh', 'zh', 'ch', 'r', 'j', 'q', 'x'}
SIBILANT_JAW = .12
STOP_ATTACK = .04
SILENCE_GAP = .06
CLOSE_TIME = .10
HOLD_STEP = .20
COART = .40


def vowel_plan(final):
    if 'a' in final:
        core = 'a'
    elif 'o' in final:
        core = 'o'
    elif 'e' in final:
        core = 'e'
    elif re.search(r'[uüv]', final):
        core = 'u'
    else:
        core = 'i'
    if re.match(r'^i[aeou]', final):
        first = 'i'
    elif re.match(r'^[uüv][aeio]', final):
        first = 'u'
    else:
        first = core
    if re.search(r'(ai|ei|ui)$', final):
        last = 'i'
    elif re.search(r'(ao|ou|iu)$', final):
        last = 'u'
    else:
        last = core
    seq = []
    for v in (first, core, last):
        if not seq or seq[-1] != v:
            seq.append(v)
    return seq, core


def build_viseme_track(chars, amp_at, duration):
    """chars: [{start,end,initial,final}] absolute seconds, sorted."""
    keys = []

    def emit(t, jaw, width, rounding, seal=0.0, labiodental=0.0, teeth=0.0, purse=0.0):
        t = round(round(t / STEP) * STEP, 2)
        amp = amp_at(t)
        keys.append({
            't': t,
            'jaw': round(min(max(jaw * amp, 0), 1), 4),
            'width': round(min(max(width, -1), 1), 4),
            'rounding': round(min(max(rounding, 0), 1), 4),
            'seal': round(min(max(seal, 0), 1), 4),
            'labiodental': round(min(max(labiodental, 0), 1), 4),
            'teeth': round(min(max(teeth, 0), 1), 4),
            'purse': round(min(max(purse, 0), 1), 4),
            'amplitude': round(amp, 4),
        })

    def silence(after, until):
        if until - after <= SILENCE_GAP:
            return
        t = after + CLOSE_TIME
        emit(t, 0, 0, 0)
        t += HOLD_STEP
        while t < until - .02:
            emit(t, 0, 0, 0)
            t += HOLD_STEP

    silence(-CLOSE_TIME, chars[0]['start'])
    for idx, c in enumerate(chars):
        s = c['start']
        nxt_start = chars[idx + 1]['start'] if idx + 1 < len(chars) else None
        e = min(c['end'], nxt_start) if nxt_start is not None else c['end']
        dur = e - s
        initial, final = c['initial'], c['final']
        seq, core = vowel_plan(final)
        ct = VOWELS[core]
        cons = min(.25 * dur, .120) if initial else 0.0
        onset = s + cons
        vlen = max(e - onset, .03)
        cw, cr = COART * ct[1], COART * ct[2]
        if initial in STOPS:
            emit(s, 0, cw, cr, seal=1)
            emit(onset - .03, 0, cw, cr, seal=1)
            emit(onset, .15, cw, cr, seal=0)
        elif initial == FRICATIVE_F:
            emit(s, .15, cw, cr, labiodental=1)
            emit(onset - .02, .15, cw, cr, labiodental=1)
            emit(onset, .2, cw, cr, labiodental=0)
        elif initial in SIBILANTS:
            emit(s, SIBILANT_JAW, cw, cr, teeth=1)
            emit(onset, SIBILANT_JAW, cw, cr, teeth=1)
        else:
            j = min(.22, COART * ct[0])
            emit(s, j, cw, cr)
            if cons > .05:
                emit(onset, j, cw, cr)
        attack = min(STOP_ATTACK if initial in STOPS else .05, .25 * vlen)
        emit(onset + attack, *VOWELS[seq[0]], purse=PURSE[seq[0]])
        fracs = [.85] if len(seq) == 2 else [.55, .85]
        for v, frac in zip(seq[1:], fracs):
            emit(onset + frac * vlen, *VOWELS[v], purse=PURSE[v])
        emit(e, *VOWELS[seq[-1]], purse=PURSE[seq[-1]])
        silence(e, nxt_start if nxt_start is not None else duration)

    keys.sort(key=lambda k: k['t'])
    track = []
    for k in keys:
        if track and k['t'] <= track[-1]['t']:
            track[-1] = k
        else:
            track.append(k)
    return track
