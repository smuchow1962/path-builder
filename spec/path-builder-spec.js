var pathBuilder = require ('../path-builder');

describe("indented source to arrays of pathnames" , function() {
  describe("indented posix path generation", function() {
    it("should print posix paths that match the space-indented tree pattern\n", function() {
      lineVerify(pathBuilder.generateLines(spaceString),posixResult);
    });
    it("should print posix paths that match the tab-indented tree pattern\n", function() {
      lineVerify(pathBuilder.generateLines(tabString),posixResult);
    });
  });

  describe("indented windows path generation", function() {
    var opts = {
      prefix: 'c:\\',
      separator:'\\'
    };
    it("should print windows paths that match the space-indented tree pattern\n", function() {
      lineVerify(pathBuilder.generateLines(spaceString,opts),windowsResult);
    });
    it("should print windows paths that match the tab-indented tree pattern\n", function() {
      lineVerify(pathBuilder.generateLines(tabString,opts),windowsResult);
    });
  });

function lineVerify(srcArray,compareArray) {
  srcArray.forEach(function(value, index){
    describe("line " + index + " should match", function() {
      it ("should equal " + compareArray[index], function() {
        expect(value).toEqual(compareArray[index]);
      });
    });
  });
}


  var spaceString =
  "gulp-tasks\n" +
  "  testDir_t\n" +
  "    testDir_t232\n" +
  "      *file.txt\n" +
  "            *file2.txt\n" +
  "      *file3.txt\n" +
  "    *file4.txt\n" +
  "  *file5.txt\n" +
    "scripts\n" +
    "src\n" +
    "*srcfile.txt\n" +
    "  client\n" +
    "    dist\n" +
    "    test\n" +
    "    app\n" +
    "      core-blocks\n" +
    "      core-js\n" +
    "      core-layout\n" +
    "    content\n" +
    "    *favicon.ico\n" +
    "      images\n" +
    "        *banner.jpg\n" +
    "      snippets\n" +
    "      styles\n" +
    "        *main.css\n" +
    "  server\n" +
    "    data\n" +
    "    dbinterface\n" +
    "    routes\n" +
    "    util\n" +
    "yyz"
  ;
  var tabString =
    "gulp-tasks\n" +
    "\ttestDir_t\n" +
    "\t\ttestDir_t232\n" +
    "\t\t\t*file.txt\n" +
    "\t\t\t*file2.txt\n" +
    "\t\t\t\t\t\t*file3.txt\n" +
    "\t\t*file4.txt\n" +
    "\t*file5.txt\n" +
    "scripts\n" +
    "src\n" +
    "*srcfile.txt\n" +
    "\tclient\n" +
    "\t\tdist\n" +
    "\t\ttest\n" +
    "\t\tapp\n" +
    "\t\t\tcore-blocks\n" +
    "\t\t\tcore-js\n" +
    "\t\t\tcore-layout\n" +
    "\t\tcontent\n" +
    "\t\t*favicon.ico\n" +
    "\t\t\timages\n" +
    "\t\t\t\t*banner.jpg\n" +
    "\t\t\tsnippets\n" +
    "\t\t\tstyles\n" +
    "\t\t\t\t*main.css\n" +
    "\tserver\n" +
    "\t\tdata\n" +
    "\t\tdbinterface\n" +
    "\t\troutes\n" +
    "\t\tutil\n" +
    "yyz"
  ;
  var posixResult = [
    './gulp-tasks/',
    './gulp-tasks/testDir_t/',
    './gulp-tasks/testDir_t/testDir_t232/',
    './gulp-tasks/testDir_t/testDir_t232/file.txt',
    './gulp-tasks/testDir_t/testDir_t232/file2.txt',
    './gulp-tasks/testDir_t/testDir_t232/file3.txt',
    './gulp-tasks/testDir_t/file4.txt',
    './gulp-tasks/file5.txt',
    './scripts/',
    './src/',
    './srcfile.txt',
    './src/client/',
    './src/client/dist/',
    './src/client/test/',
    './src/client/app/',
    './src/client/app/core-blocks/',
    './src/client/app/core-js/',
    './src/client/app/core-layout/',
    './src/client/content/',
    './src/client/favicon.ico',
    './src/client/content/images/',
    './src/client/content/images/banner.jpg',
    './src/client/content/snippets/',
    './src/client/content/styles/',
    './src/client/content/styles/main.css',
    './src/server/',
    './src/server/data/',
    './src/server/dbinterface/',
    './src/server/routes/',
    './src/server/util/',
    './yyz/'
  ];
  var windowsResult = [
  'c:\\gulp-tasks\\',
  'c:\\gulp-tasks\\testDir_t\\',
  'c:\\gulp-tasks\\testDir_t\\testDir_t232\\',
  'c:\\gulp-tasks\\testDir_t\\testDir_t232\\file.txt',
  'c:\\gulp-tasks\\testDir_t\\testDir_t232\\file2.txt',
  'c:\\gulp-tasks\\testDir_t\\testDir_t232\\file3.txt',
  'c:\\gulp-tasks\\testDir_t\\file4.txt',
  'c:\\gulp-tasks\\file5.txt',
  'c:\\scripts\\',
  'c:\\src\\',
  'c:\\srcfile.txt',
  'c:\\src\\client\\',
  'c:\\src\\client\\dist\\',
  'c:\\src\\client\\test\\',
  'c:\\src\\client\\app\\',
  'c:\\src\\client\\app\\core-blocks\\',
  'c:\\src\\client\\app\\core-js\\',
  'c:\\src\\client\\app\\core-layout\\',
  'c:\\src\\client\\content\\',
  'c:\\src\\client\\favicon.ico',
  'c:\\src\\client\\content\\images\\',
  'c:\\src\\client\\content\\images\\banner.jpg',
  'c:\\src\\client\\content\\snippets\\',
  'c:\\src\\client\\content\\styles\\',
  'c:\\src\\client\\content\\styles\\main.css',
  'c:\\src\\server\\',
  'c:\\src\\server\\data\\',
  'c:\\src\\server\\dbinterface\\',
  'c:\\src\\server\\routes\\',
  'c:\\src\\server\\util\\',
  'c:\\yyz\\'
  ];

});
