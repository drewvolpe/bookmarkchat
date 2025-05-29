import json
import tiktoken
from pathlib import Path
from typing import List, Dict, Any
import nltk
from nltk.tokenize import sent_tokenize

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab/english')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

class TextChunker:
    def __init__(self, target_tokens: int = 500):
        """Initialize the chunker with a target token count."""
        self.target_tokens = target_tokens
        self.encoding = tiktoken.get_encoding("cl100k_base")  # OpenAI's encoding

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.encoding.encode(text))

    def split_into_chunks(self, text: str) -> List[str]:
        """Split text into chunks of approximately target_tokens."""
        # First split into sentences
        sentences = sent_tokenize(text)
        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_tokens = self.count_tokens(sentence)
            
            # If a single sentence is longer than target, split it
            if sentence_tokens > self.target_tokens:
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
                    current_length = 0
                
                # Split long sentence into smaller pieces
                words = sentence.split()
                temp_chunk = []
                temp_length = 0
                
                for word in words:
                    word_tokens = self.count_tokens(word)
                    if temp_length + word_tokens > self.target_tokens:
                        chunks.append(" ".join(temp_chunk))
                        temp_chunk = [word]
                        temp_length = word_tokens
                    else:
                        temp_chunk.append(word)
                        temp_length += word_tokens
                
                if temp_chunk:
                    chunks.append(" ".join(temp_chunk))
                continue

            # If adding this sentence would exceed target, start new chunk
            if current_length + sentence_tokens > self.target_tokens:
                chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]
                current_length = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_length += sentence_tokens

        # Add the last chunk if it exists
        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def process_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Process a single cached page file and return chunks with metadata."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = json.load(f)

        chunks = self.split_into_chunks(content['text'])
        
        # Create chunk objects with metadata
        chunk_objects = []
        for i, chunk in enumerate(chunks):
            chunk_objects.append({
                'chunk_id': i,
                'text': chunk,
                'url': content['url'],
                'title': content['title'],
                'token_count': self.count_tokens(chunk)
            })
        
        return chunk_objects

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Split text into chunks")
    parser.add_argument("--file", type=str, help="Path to a single text file to process")
    parser.add_argument("--dir", type=str, help="Directory containing text files to process")
    args = parser.parse_args()

    chunker = TextChunker()
    
    if args.file:
        # Process single file
        file_path = Path(args.file)
        chunks = chunker.process_file(file_path)
        print(f"Split {file_path} into {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            print(f"\nChunk {i+1} ({chunk['token_count']} tokens):")
            print(chunk['text'][:200] + "...")
    
    elif args.dir:
        # Process directory
        dir_path = Path(args.dir)
        total_chunks = 0
        for file_path in dir_path.glob("*.txt"):
            chunks = chunker.process_file(file_path)
            total_chunks += len(chunks)
            print(f"Split {file_path} into {len(chunks)} chunks")
        print(f"\nTotal chunks across all files: {total_chunks}")

if __name__ == "__main__":
    main() 