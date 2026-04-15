/// Find the word boundaries around the given character offset in text.
/// Returns (word_start, word_end) as character offsets.
/// Words are delimited by whitespace and punctuation.
pub fn word_boundaries(text: &str, offset: usize) -> (usize, usize) {
    let chars: Vec<char> = text.chars().collect();
    if chars.is_empty() {
        return (0, 0);
    }
    let offset = offset.min(chars.len());

    // If at end or on whitespace/punctuation, try to select the word before
    let probe = if offset > 0 && (offset >= chars.len() || !chars[offset].is_alphanumeric()) {
        offset - 1
    } else {
        offset
    };

    if probe >= chars.len() || !chars[probe].is_alphanumeric() {
        return (offset, offset); // no word at this position
    }

    // Scan backward to word start
    let mut start = probe;
    while start > 0 && chars[start - 1].is_alphanumeric() {
        start -= 1;
    }

    // Scan forward to word end
    let mut end = probe + 1;
    while end < chars.len() && chars[end].is_alphanumeric() {
        end += 1;
    }

    (start, end)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn word_at_start() {
        assert_eq!(word_boundaries("hello world", 0), (0, 5));
    }

    #[test]
    fn word_in_middle() {
        assert_eq!(word_boundaries("hello world", 7), (6, 11));
    }

    #[test]
    fn word_at_end() {
        assert_eq!(word_boundaries("hello world", 11), (6, 11));
    }

    #[test]
    fn word_on_space() {
        // On the space between words — selects the word before
        assert_eq!(word_boundaries("hello world", 5), (0, 5));
    }

    #[test]
    fn single_word() {
        assert_eq!(word_boundaries("hello", 2), (0, 5));
    }

    #[test]
    fn empty_text() {
        assert_eq!(word_boundaries("", 0), (0, 0));
    }

    #[test]
    fn punctuation_boundary() {
        assert_eq!(word_boundaries("hello, world", 0), (0, 5));
        assert_eq!(word_boundaries("hello, world", 7), (7, 12));
    }
}
