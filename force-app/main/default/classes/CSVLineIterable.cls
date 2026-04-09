public class CSVLineIterable implements Iterable<String>, Iterator<String> {

    private String data;
    private Integer index = 0;
    private Integer length;

    public CSVLineIterable(Blob csvBlob) {
        this.data = csvBlob.toString();
        this.length = data.length();
    }

    // Iterable
    public Iterator<String> iterator() {
        return this;
    }

    // Iterator
    public Boolean hasNext() {
        return index < length;
    }

    public String next() {
        String line = '';

        while (index < length) {
            String ch = data.substring(index, index + 1);
            index++;

            if (ch == '\n') {
                break;
            }
            if (ch != '\r') {
                line += ch;
            }
        }

        return line;
    }
}