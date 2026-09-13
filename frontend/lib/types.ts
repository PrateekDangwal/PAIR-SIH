export interface User { id:string; email:string; name:string; }
export interface AuthContextType {
  user:User|null; isLoading:boolean;
  login:(email:string,password:string)=>Promise<void>;
  signup:(email:string,password:string)=>Promise<void>;
  logout:()=>void;
}
export interface Project { id:number; name:string; description:string|null; gem_tender_id:string|null; status:string; created_at:string; updated_at:string; }
export interface Requirement { id:number; project_id:number; source_document_id:number; title:string; description:string|null; requirement_text:string; category:string; is_mandatory:boolean; priority:number; severity:string; source_page_number:number|null; extraction_confidence:number|null; extracted_by_model:string|null; created_at:string; }
export interface Evidence { id:number; project_id:number; source_document_id:number; evidence_text:string; evidence_type:string; source_page_number:number|null; confidence:number|null; extracted_by_model:string|null; created_at:string; }
export interface DocumentItem { id:number; project_id:number; filename:string; file_size:number; mime_type:string; document_type:string; extraction_status:string; page_count:number|null; created_at:string; }
export interface Summary { project_id:number; total_requirements:number; evaluated_requirements:number; unevaluated_requirements:number; compliant:number; partial:number; non_compliant:number; needs_review:number; insufficient_data:number; compliance_score:number; risk_level:'low'|'medium'|'high'; mandatory_failures:Record<string,unknown>[]; }
