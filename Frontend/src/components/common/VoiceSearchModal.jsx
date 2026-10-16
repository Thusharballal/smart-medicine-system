/**
 * VoiceSearchModal
 *
 * Real browser-based voice search using the Web Speech API.
 *
 * Flow:
 *
 * User speaks:
 *      "para"
 *          ↓
 * SpeechRecognition
 *          ↓
 * "para"
 *          ↓
 * onResult("para")
 *          ↓
 * MedicineSearchPage
 *
 * IMPORTANT:
 * This component does NOT hardcode medicine names.
 *
 * It returns whatever the user actually says.
 *
 * Example:
 *
 * "para"          → "para"
 * "paracetamol"   → "paracetamol"
 * "amox"          → "amox"
 * "metformin"     → "metformin"
 *
 * The medicine search system should then perform
 * partial/fuzzy matching against the medicine database.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  HiOutlineMicrophone,
  HiOutlineXMark,
  HiOutlineStopCircle,
} from 'react-icons/hi2'

// =====================================================
// Speech Recognition support
// =====================================================

function getSpeechRecognition() {
  if (typeof window === 'undefined') {
    return null
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  )
}

// =====================================================
// Voice Search Modal
// =====================================================

function VoiceSearchModal({
  isOpen,
  onClose,
  onResult,
}) {
  const [phase, setPhase] =
    useState('idle')
  // idle | listening | done | error

  const [result, setResult] =
    useState('')

  const [error, setError] =
    useState('')

  const [supported, setSupported] =
    useState(true)

  const recognitionRef =
    useRef(null)

  // ===================================================
  // Check browser support
  // ===================================================

  useEffect(() => {
    const Recognition =
      getSpeechRecognition()

    setSupported(
      Boolean(Recognition)
    )
  }, [])

  // ===================================================
  // Cleanup speech recognition
  // ===================================================

  const stopRecognition =
    useCallback(() => {
      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore stop errors
        }

        recognitionRef.current =
          null
      }
    }, [])

  // ===================================================
  // Cleanup when modal closes/unmounts
  // ===================================================

  useEffect(() => {
    if (!isOpen) {
      stopRecognition()

      setPhase('idle')
      setResult('')
      setError('')
    }

    return () => {
      stopRecognition()
    }
  }, [
    isOpen,
    stopRecognition,
  ])

  // ===================================================
  // Start real voice recognition
  // ===================================================

  const startListening =
    useCallback(() => {
      const Recognition =
        getSpeechRecognition()

      if (!Recognition) {
        setSupported(false)

        setPhase('error')

        setError(
          'Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
        )

        return
      }

      // Stop any existing session
      stopRecognition()

      setResult('')
      setError('')
      setPhase('listening')

      const recognition =
        new Recognition()

      recognition.continuous = false

      recognition.interimResults =
        true

      recognition.maxAlternatives =
        3

      // Indian English
      recognition.lang =
        'en-IN'

      // ===============================================
      // Recognition started
      // ===============================================

      recognition.onstart = () => {
        setPhase(
          'listening'
        )
      }

      // ===============================================
      // Recognition result
      // ===============================================
        recognition.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
          ) {
            const transcript =
              event.results[i][0]?.transcript || ''

            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          const finalText = finalTranscript.trim()
          const interimText = interimTranscript.trim()

          // Show what the user is currently saying
          if (interimText) {
            setResult(interimText)
          }

          // Automatically search when speech is finalized
          if (finalText) {
            setResult(finalText)
            setPhase('done')

            // Automatically send the voice result
            // to MedicineSearchPage
            setTimeout(() => {
              onResult?.(finalText)
              onClose?.()
            }, 300)
          }
        }
      // ===============================================
      // Recognition error
      // ===============================================
      recognition.onerror = (
        event
      ) => {
        console.error(
          'Speech recognition error:',
          event.error
        )
        recognitionRef.current =
          null
        setPhase('error')
        switch (
          event.error
        ) {
          case 'not-allowed':
          case 'service-not-allowed':
            setError(
              'Microphone permission was denied. Please allow microphone access and try again.'
            )
            break
          case 'no-speech':
            setError(
              'No speech was detected. Please speak the medicine name and try again.'
            )
            break
          case 'audio-capture':
            setError(
              'No microphone was detected. Please check your microphone.'
            )
            break
          case 'network':
            setError(
              'Voice recognition requires a network connection. Please check your connection and try again.'
            )
            break
          default:
            setError(
              'Voice recognition failed. Please try again.'
            )
        }
      }
      // ===============================================
      // Recognition ended
      // ===============================================
      recognition.onend = () => {
        recognitionRef.current =
          null
        setPhase(
          (currentPhase) =>
            currentPhase ===
            'listening'
              ? result
                ? 'done'
                : 'idle'
              : currentPhase
        )
      }
      recognitionRef.current =
        recognition
      try {
        recognition.start()
      } catch (err) {
        console.error(
          'Unable to start speech recognition:',
          err
        )

        recognitionRef.current =
          null

        setPhase('error')

        setError(
          'Unable to start voice recognition. Please try again.'
        )
      }
    }, [
      stopRecognition,
      result,
    ])
  // ===================================================
  // Stop listening
  // ===================================================
  const handleStop =
    useCallback(() => {
      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore stop errors
        }
      }
      recognitionRef.current =
        null
      setPhase(
        result
          ? 'done'
          : 'idle'
      )
    }, [result])
  // ===================================================
  // Use recognized result
  // ===================================================
  const handleUseResult =
    useCallback(() => {
      const trimmed =
        result.trim()

      if (!trimmed) {
        return
      }
      onResult?.(trimmed)
      onClose?.()
    }, [
      result,
      onResult,
      onClose,
    ])
  // ===================================================
  // Retry
  // ===================================================
  const handleRetry =
    useCallback(() => {
      setResult('')
      setError('')
      setPhase('idle')
    }, [])
  // ===================================================
  // Close
  // ===================================================
  const handleClose =
    useCallback(() => {
      stopRecognition()
      setPhase('idle')
      setResult('')
      setError('')
      onClose?.()
    }, [
      stopRecognition,
      onClose,
    ])
  // ===================================================
  // Don't render when closed
  // ===================================================
  if (!isOpen) {
    return null
  }
  // ===================================================
  // Render
  // ===================================================
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="
        fixed
        inset-0
        z-[400]
        flex
        items-center
        justify-center
        p-4
      "
    >
      {/* =============================================
          Backdrop
      ============================================= */}
      <div
        className="
          absolute
          inset-0
          bg-slate-900/50
          backdrop-blur-sm
        "
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* =============================================
          Modal
      ============================================= */}
      <div
        className="
          relative
          flex
          w-full
          max-w-sm
          flex-col
          items-center
          gap-5
          rounded-2xl
          bg-white
          p-6
          shadow-xl
        "
      >
        {/* ===========================================
            Close
        =========================================== */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close voice search"
          className="
            absolute
            right-4
            top-4
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-slate-400
            transition-colors
            hover:bg-slate-100
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary-500
          "
        >
          <HiOutlineXMark
            size={18}
            aria-hidden="true"
          />
        </button>
        {/* ===========================================
            Title
        =========================================== */}
        <div className="text-center">
          <h2
            id="voice-modal-title"
            className="
              flex
              items-center
              justify-center
              gap-2
              text-base
              font-bold
              text-slate-900
            "
          >
            <HiOutlineMicrophone
              size={18}
              className="text-primary-600"
              aria-hidden="true"
            />
            Voice Search
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Speak the medicine name
          </p>
        </div>
        {/* ===========================================
            Microphone animation
        =========================================== */}
        <div className="relative flex items-center justify-center">

          {phase ===
            'listening' && (
            <>
              <span
                className="
                  absolute
                  h-24
                  w-24
                  animate-ping
                  rounded-full
                  bg-primary-100
                  opacity-40
                "
                aria-hidden="true"
              />

              <span
                className="
                  absolute
                  h-20
                  w-20
                  animate-ping
                  rounded-full
                  bg-primary-100
                  opacity-30
                "
                aria-hidden="true"
              />
            </>
          )}
          <div
            className={`
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              transition-colors
              ${
                phase ===
                'listening'
                  ? 'bg-primary-600'
                  : phase === 'done'
                    ? 'bg-success-600'
                    : phase === 'error'
                      ? 'bg-danger-100'
                      : 'bg-slate-100'
              }
            `}
          >
            <HiOutlineMicrophone
              size={28}
              className={`
                ${
                  phase ===
                    'listening' ||
                  phase === 'done'
                    ? 'text-white'
                    : phase === 'error'
                      ? 'text-danger-600'
                      : 'text-slate-400'
                }
              `}
              aria-hidden="true"
            />
          </div>
        </div>
        {/* ===========================================
            Status
        =========================================== */}
        <div
          className="
            flex
            min-h-[4rem]
            flex-col
            items-center
            justify-center
            text-center
          "
        >
          {phase ===
            'idle' && (
            <p className="text-sm text-slate-600">
              Press the button to start
              speaking
            </p>
          )}

          {phase ===
            'listening' && (
            <>
              <p
                className="
                  animate-pulse
                  text-sm
                  font-semibold
                  text-primary-700
                "
              >
                Listening…
              </p>
              {result && (
                <p className="mt-1 text-xs text-slate-500">
                  {result}
                </p>
              )}
            </>
          )}
          {phase ===
            'done' &&
            result && (
              <>
                <p className="mb-1 text-xs text-slate-500">
                  You said:
                </p>

                <p
                  className="
                    rounded-lg
                    bg-primary-50
                    px-4
                    py-1.5
                    text-base
                    font-bold
                    text-slate-900
                  "
                >
                  {result}
                </p>
              </>
            )}
          {phase ===
            'error' && (
            <p className="text-center text-xs font-medium text-danger-600">
              {error}
            </p>
          )}
        </div>
        {/* ===========================================
            Examples
        =========================================== */}
        <div
          className="
            w-full
            rounded-xl
            bg-slate-50
            px-4
            py-3
          "
        >
          <p
            className="
              mb-2
              text-[10px]
              font-semibold
              uppercase
              tracking-widest
              text-slate-500
            "
          >
            Try saying
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              '"Paracetamol"',
              '"para"',
              '"Amoxicillin"',
              '"met"',
            ].map(
              (example) => (
                <span
                  key={example}
                  className="
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-2
                    py-0.5
                    text-xs
                    text-slate-600
                  "
                >
                  {example}
                </span>
              )
            )}
          </div>
        </div>
        {/* ===========================================
            Buttons
        =========================================== */}
        <div className="flex w-full gap-2">
          {/* Idle */}
          {phase ===
            'idle' && (
            <button
              type="button"
              onClick={
                startListening
              }
              disabled={
                !supported
              }
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary-600
                py-2.5
                text-sm
                font-bold
                text-white
                transition-colors
                hover:bg-primary-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <HiOutlineMicrophone
                size={16}
                aria-hidden="true"
              />
              Start Listening
            </button>
          )}
          {/* Listening */}
          {phase ===
            'listening' && (
            <>
              <button
                type="button"
                onClick={
                  handleStop
                }
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-danger-600
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-danger-700
                "
              >
                <HiOutlineStopCircle
                  size={16}
                  aria-hidden="true"
                />
                Stop
              </button>

              <button
                type="button"
                onClick={
                  handleClose
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                Cancel
              </button>
            </>
          )}
          {/* Done */}
          {phase === 'done' && (
            <>
              <div className="flex-1 flex items-center justify-center py-2.5">
                <span className="text-sm font-semibold text-primary-700">
                  Searching for "{result}"…
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhase('idle')
                  setResult('')
                  setError('')
                }}
                className="
                  px-4 py-2.5 rounded-xl
                  border border-slate-200
                  text-slate-600
                  text-sm font-semibold
                  hover:bg-slate-50
                  transition-colors
                "
              >
                Retry
              </button>
            </>
          )}
          {/* Error */}
          {phase ===
            'error' && (
            <>
              <button
                type="button"
                onClick={
                  handleRetry
                }
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary-600
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  hover:bg-primary-700
                "
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={
                  handleClose
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                Close
              </button>
            </>
          )}
        </div>
        {/* ===========================================
            Browser support notice
        =========================================== */}
        {!supported && (
          <p className="text-center text-[10px] text-danger-500">
            Voice search is not supported
            in this browser. Please use
            Google Chrome or Microsoft Edge.
          </p>
        )}
        {supported && (
          <p className="text-center text-[10px] text-slate-400">
            Voice recognition uses your
            browser microphone.
          </p>
        )}
      </div>
    </div>
  )
}
export default VoiceSearchModal