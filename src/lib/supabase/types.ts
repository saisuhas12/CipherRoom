export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          password_hash: string;
          created_by: string;
          expires_at: string;
          failed_attempts: number;
          locked_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          password_hash: string;
          created_by: string;
          expires_at: string;
          failed_attempts?: number;
          locked_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          password_hash?: string;
          created_by?: string;
          expires_at?: string;
          failed_attempts?: number;
          locked_until?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          username: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          username: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          username?: string;
          content?: string;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          room_id: string;
          content: string;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          content?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          content?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          room_id: string;
          filename: string;
          original_name: string;
          size: number;
          mime_type: string;
          storage_path: string;
          uploaded_by: string;
          is_encrypted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          filename: string;
          original_name: string;
          size: number;
          mime_type: string;
          storage_path: string;
          uploaded_by: string;
          is_encrypted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          filename?: string;
          original_name?: string;
          size?: number;
          mime_type?: string;
          storage_path?: string;
          uploaded_by?: string;
          is_encrypted?: boolean;
          created_at?: string;
        };
      };
    };
  };
};

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type FileRecord = Database["public"]["Tables"]["files"]["Row"];
