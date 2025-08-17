import os
from groq import Groq

def read_file_safely(file_path):
    """Read file with proper encoding handling"""
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                return file.read()
        except UnicodeDecodeError:
            continue
    
    with open(file_path, 'rb') as file:
        return file.read().decode('utf-8', errors='replace')

def analyze_conversation_direct(file_path):
    client = Groq(api_key="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")
    
    text = read_file_safely(file_path)
    
    # Handle large texts by chunking
    max_chars = 12000  # Conservative limit for tokens
    
    if len(text) > max_chars:
        chunks = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
        summaries = []
        
        for i, chunk in enumerate(chunks):
            prompt = f"""
            Analyze this conversation segment (part {i+1}/{len(chunks)}) and provide:
            1. Key themes and time periods
            2. Member progress and engagement
            3. Team performance evaluation (rate 1-5 on timeliness, communication, personalization, responsiveness)
            4. Notable outcomes and improvements
            
            Text: {chunk}
            """
            
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                max_tokens=1500,
                temperature=0.3
            )
            summaries.append(f"=== Segment {i+1} ===\n{response.choices[0].message.content}")
        
        # Create final consolidated summary
        all_summaries = "\n\n".join(summaries)
        final_prompt = f"""
        Based on these segment analyses, create a comprehensive journey summary with:
        1. Overall journey periods (months/phases)
        2. Team performance evaluation with scores
        3. Member progress trajectory
        4. Key insights and recommendations
        
        Segment Analyses:
        {all_summaries}
        """
        
        final_response = client.chat.completions.create(
            messages=[{"role": "user", "content": final_prompt}],
            model="llama-3.1-8b-instant",
            max_tokens=2000,
            temperature=0.3
        )
        
        return final_response.choices.message.content
    
    else:
        prompt = f"""
        Analyze this conversation log and create a structured summary:
        1. Divide the journey into distinct periods based on themes and milestones
        2. For each period, evaluate team performance on:
           - Timeliness of scheduling and reminders (1-5 scale)
           - Monitoring and adapting to member data (1-5 scale)
           - Clear and actionable communication (1-5 scale)
           - Personalization to member needs (1-5 scale)
           - Responsiveness to queries (1-5 scale)
           - Support for adherence and motivation (1-5 scale)
           - Progress tracking effectiveness (1-5 scale)
        3. Track member progress and key outcomes
        4. Provide overall insights and recommendations
        
        Conversation: {text}
        """
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="lllama-3.1-8b-instant",
            max_tokens=3000,
            temperature=0.3
        )
        
        return response.choices[0].message.content

# Usage
if __name__ == "__main__":
    try:
        analysis = analyze_conversation_direct('Conversation.txt')
        print(analysis)
        
        # Save results
        with open('conversation_analysis.txt', 'w', encoding='utf-8') as f:
            f.write(analysis)
            
        print("\n✅ Analysis complete! Results saved to 'conversation_analysis.txt'")
        
    except Exception as e:
        print(f"❌ Error: {e}")
