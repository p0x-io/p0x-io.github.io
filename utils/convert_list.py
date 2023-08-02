def text_to_js_list(input_file, output_file):
    with open(input_file, 'r') as file:
        text = file.read()

    # Split the text using periods as the delimiter and remove any leading/trailing spaces
    elements = [elem.strip() for elem in text.split('.')]

    # Convert the elements list to a JavaScript list string
    js_list = '[' + ', '.join("'" + elem + "'" for elem in elements) + ']'

    with open(output_file, 'w') as file:
        file.write(js_list)


def read_list_from_txt(file_path):
    with open(file_path, 'r') as file:
        # Read the lines from the txt file and remove any leading/trailing whitespaces
        lines = [line.strip() for line in file.readlines()]
    return lines


def write_list_to_js(array, file_path):
    with open(file_path, 'w') as file:
        file.write('const wordList = [\n')
        for item in array:
            file.write(f'    \'{item}\',\n')
        file.write('];\n')


if __name__ == '__main__':
    # input_txt_file = "shampoo_1.txt"
    # output_js_file = "shampoo_2.js"
    # text_to_js_list(input_txt_file, output_js_file)

    txt_file_path = 'shampoo-2.txt'  # Replace with the path to your .txt file
    js_file_path = '../js/chatgpt-3.js'   # Replace with the desired path for the output .js file

    input_list = read_list_from_txt(txt_file_path)
    write_list_to_js(input_list, js_file_path)

    print('List conversion completed successfully!')
