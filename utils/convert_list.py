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
    txt_file_path = 'rockyou-30.txt'  # Replace with the path to your .txt file
    js_file_path = 'js/rockyou-30.js'   # Replace with the desired path for the output .js file

    input_list = read_list_from_txt(txt_file_path)
    write_list_to_js(input_list, js_file_path)

    print('List conversion completed successfully!')
