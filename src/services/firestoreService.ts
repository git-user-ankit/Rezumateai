import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  addDoc, 
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { ResumeData, ATSAnalysis, ChatMessage } from '../../types';

export const saveChatHistory = async (userId: string, messages: ChatMessage[]) => {
  if (!userId) return;
  const chatRef = doc(db, 'users', userId, 'data', 'chat_history');
  await setDoc(chatRef, {
    messages,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  if (!userId) return [];
  const chatRef = doc(db, 'users', userId, 'data', 'chat_history');
  const chatDoc = await getDoc(chatRef);
  if (chatDoc.exists()) {
    return chatDoc.data().messages || [];
  }
  return [];
};

export const saveAtsResult = async (userId: string, result: ATSAnalysis) => {
  if (!userId) return;
  const atsRef = doc(db, 'users', userId, 'data', 'ats_result');
  await setDoc(atsRef, {
    ...result,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getAtsResult = async (userId: string): Promise<ATSAnalysis | null> => {
  if (!userId) return null;
  const atsRef = doc(db, 'users', userId, 'data', 'ats_result');
  const atsDoc = await getDoc(atsRef);
  if (atsDoc.exists()) {
    return atsDoc.data() as ATSAnalysis;
  }
  return null;
};

export const saveExtractedData = async (userId: string, data: ResumeData) => {
  if (!userId) return;
  const extractedRef = doc(db, 'users', userId, 'data', 'extracted_resume');
  await setDoc(extractedRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getExtractedData = async (userId: string): Promise<ResumeData | null> => {
  if (!userId) return null;
  const extractedRef = doc(db, 'users', userId, 'data', 'extracted_resume');
  const extractedDoc = await getDoc(extractedRef);
  if (extractedDoc.exists()) {
    return extractedDoc.data() as ResumeData;
  }
  return null;
};

export const saveChatResumeId = async (userId: string, resumeId: string | null) => {
  if (!userId) return;
  const chatResumeRef = doc(db, 'users', userId, 'data', 'chat_resume_context');
  await setDoc(chatResumeRef, {
    resumeId,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getChatResumeId = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  const chatResumeRef = doc(db, 'users', userId, 'data', 'chat_resume_context');
  const chatResumeDoc = await getDoc(chatResumeRef);
  if (chatResumeDoc.exists()) {
    return chatResumeDoc.data().resumeId || null;
  }
  return null;
};
