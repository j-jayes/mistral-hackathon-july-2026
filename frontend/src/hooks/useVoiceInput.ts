import { useState, useCallback, useRef, useEffect } from 'react';
import { ProcessingResult, UserInput } from '@/types';
import { apiClient } from '@/api/client';

interface VoiceInputState {
  is_recording: boolean;
  is_processing: boolean;
  audio_blob: Blob | null;
  audio_url: string | null;
  error: string | null;
  language: string;
  supported_languages: string[];
}

interface UseVoiceInputOptions {
  language?: string;
  onSuccess?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [state, setState] = useState<VoiceInputState>({
    is_recording: false,
    is_processing: false,
    audio_blob: null,
    audio_url: null,
    error: null,
    language: options.language || 'fr',
    supported_languages: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Load supported languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await apiClient.get_voice_languages();
        setState(prev => ({ ...prev, supported_languages: languages }));
      } catch (error) {
        console.error('Failed to load voice languages:', error);
        // Set default languages
        setState(prev => ({
          ...prev,
          supported_languages: ['fr', 'en', 'es', 'de', 'it']
        }));
      }
    };
    
    loadLanguages();
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Check if already recording
      if (state.is_recording) {
        console.log('Already recording');
        return;
      }

      // Clean up previous recording
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/wav',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({
          ...prev,
          audio_blob: audioBlob,
          audio_url: audioUrl,
          is_recording: false,
        }));
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };
      
      mediaRecorder.onerror = (error) => {
        console.error('Media recorder error:', error);
        setState(prev => ({
          ...prev,
          error: 'Error during recording',
          is_recording: false,
        }));
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };
      
      // Start recording
      mediaRecorder.start();
      setState(prev => ({ ...prev, is_recording: true, error: null }));
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      let error_message = 'Failed to start recording';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          error_message = 'Microphone access denied. Please enable microphone permissions.';
        } else if (error.name === 'NotFoundError') {
          error_message = 'No microphone found on this device.';
        } else {
          error_message = error.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        error: error_message,
        is_recording: false,
      }));
      
      options.onError?.(error_message);
    }
  }, [state.is_recording, options]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!state.is_recording || !mediaRecorderRef.current) {
      return null;
    }

    // Stop recording
    mediaRecorderRef.current.stop();
    
    return new Promise<Blob | null>((resolve) => {
      // Wait for onstop event to fire
      const checkAudio = setInterval(() => {
        if (state.audio_blob) {
          clearInterval(checkAudio);
          resolve(state.audio_blob);
        }
      }, 100);
      
      // Timeout after 2 seconds
      setTimeout(() => {
        clearInterval(checkAudio);
        resolve(state.audio_blob);
      }, 2000);
    });
  }, [state.is_recording, state.audio_blob]);

  // Process recorded audio
  const processAudio = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) return null;
    
    setState(prev => ({ ...prev, is_processing: true, error: null }));
    
    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], 'voice-input.wav', { type: 'audio/wav' });
      
      // Process through API
      const result = await apiClient.process_voice(audioFile, state.language);
      
      setState(prev => ({ ...prev, is_processing: false }));
      
      return result;
    } catch (error) {
      console.error('Error processing audio:', error);
      setState(prev => ({
        ...prev,
        is_processing: false,
        error: 'Failed to process audio',
      }));
      
      options.onError?.('Failed to process audio');
      return null;
    }
  }, [state.language, options]);

  // Record and process in one step
  const recordAndProcess = useCallback(async () => {
    try {
      // Start recording
      await startRecording();
      
      // Wait a moment, then stop (in real app, user would stop manually)
      // For demo purposes, we'll auto-stop after 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stop recording
      const audioBlob = await stopRecording();
      
      if (audioBlob) {
        // Process the audio
        const result = await processAudio(audioBlob);
        
        if (result && result.success && options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error in record and process:', error);
      return null;
    }
  }, [startRecording, stopRecording, processAudio, options]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && state.is_recording) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Revoke object URL if it exists
      if (state.audio_url) {
        URL.revokeObjectURL(state.audio_url);
      }
    };
  }, [state.is_recording, state.audio_url]);

  // Clean up audio URL when it changes
  useEffect(() => {
    return () => {
      if (state.audio_url) {
        URL.revokeObjectURL(state.audio_url);
      }
    };
  }, [state.audio_url]);

  return {
    ...state,
    startRecording,
    stopRecording,
    processAudio,
    recordAndProcess,
    setLanguage: (language: string) => {
      setState(prev => ({ ...prev, language }));
    },
    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    },
  };
}

export default useVoiceInput;