export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          message: string;
          source: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          message: string;
          source?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          message?: string;
          source?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          lead_id: string;
          message: string;
          reply: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          message: string;
          reply: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          message?: string;
          reply?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          id: string;
          business_name: string;
          owner_name: string;
          phone: string;
          plan: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          owner_name: string;
          phone: string;
          plan: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          owner_name?: string;
          phone?: string;
          plan?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

