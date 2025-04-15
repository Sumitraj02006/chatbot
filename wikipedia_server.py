from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

def get_wikipedia_short_summary(query):
    """Retrieves a short summary from Wikipedia."""
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": query,
        "srlimit": 1,
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if data["query"]["search"]:
            page_title = data["query"]["search"][0]["title"]
            page_summary = get_short_page_summary(page_title)
            return page_summary
        else:
            return "I couldn't find any information on Wikipedia for your query."

    except requests.exceptions.RequestException as e:
        return f"Error: {e}"
    except (KeyError, IndexError):
        return "Error processing data from Wikipedia."

def get_short_page_summary(page_title):
    """Retrieves a short summary from a Wikipedia page."""
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "titles": page_title,
        "prop": "extracts",
        "exintro": True,
        "explaintext": True,
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        pages = data["query"]["pages"]
        page_id = next(iter(pages))
        page_extract = pages[page_id].get("extract", "Summary not found.")

        # Return the first sentence for a short summary
        sentences = page_extract.split(". ")
        if sentences:
            return sentences[0] + "."
        else:
            return "Summary not found."

    except requests.exceptions.RequestException as e:
        return f"Error: {e}"
    except (KeyError, IndexError):
        return "Error processing Wikipedia page."

@app.route('/wikipedia_summary', methods=['POST'])
def wikipedia_summary():
    data = request.get_json()
    query = data.get('query')
    if not query:
        return jsonify({'error': 'Query parameter is missing'}), 400
    summary = get_wikipedia_short_summary(query)
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(debug=True)